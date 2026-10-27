const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 1024;
const SUPPORTED = new Set(['image/png', 'image/jpeg', 'image/webp']);

export async function preparePFPImage(file, removeBackground=true) {
  if(!SUPPORTED.has(file?.type))throw new Error('Use a PNG, JPEG or WebP image.');
  if(file.size>MAX_FILE_BYTES)throw new Error('Image must be smaller than 10 MB.');
  const bitmap=await createImageBitmap(file);
  try {
    const scale=Math.min(1, MAX_DIMENSION/Math.max(bitmap.width,bitmap.height));
    const width=Math.max(1,Math.round(bitmap.width*scale));
    const height=Math.max(1,Math.round(bitmap.height*scale));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(bitmap,0,0,width,height);
    const img=ctx.getImageData(0,0,width,height);
    const px=img.data;
    const corners=[[0,0],[width-1,0],[0,height-1],[width-1,height-1]];
    const samples=corners.map(([x,y])=>{
      const i=(y*width+x)*4;return [px[i],px[i+1],px[i+2]];
    });
    const base=[0,1,2].map(ch=>samples.reduce((sum,r)=>sum+r[ch],0)/4);
    const deviation=Math.max(...samples.map(r=>Math.hypot(...r.map((v,i)=>v-base[i]))));
    const flatBackground=removeBackground && deviation<38;
    const alpha=new Uint8Array(width*height);
    const depthCanvas=document.createElement('canvas');depthCanvas.width=width;depthCanvas.height=height;
    const depthCtx=depthCanvas.getContext('2d');const d=depthCtx.createImageData(width,height);
    for(let i=0;i<width*height;i++){
      const k=i*4;const r=px[k],g=px[k+1],b=px[k+2];
      const diff=Math.hypot(r-base[0],g-base[1],b-base[2]);
      if(flatBackground)px[k+3]=Math.round(px[k+3]*Math.min(1,Math.max(0,(diff-19)/35)));
      const saturation=Math.max(r,g,b)-Math.min(r,g,b);
      const brightness=(r+g+b)/3;
      const bump=Math.max(32,Math.min(235,55+saturation*.58+brightness*.28));
      d.data[k]=d.data[k+1]=d.data[k+2]=bump;
      d.data[k+3]=255;
      alpha[i]=px[k+3];
    }
    ctx.putImageData(img,0,0);depthCtx.putImageData(d,0,0);
    const aspect=Math.max(width,height);
    // Data URL is used only for the explicit server-side conversion request.
    // Keep within typical serverless request-body limits.
    const apiCanvas=document.createElement('canvas');apiCanvas.width=width;apiCanvas.height=height;
    const apiCtx=apiCanvas.getContext('2d');apiCtx.fillStyle='#161122';apiCtx.fillRect(0,0,width,height);
    apiCtx.drawImage(canvas,0,0);
    return {
      colorCanvas:canvas, heightCanvas:depthCanvas, alpha, width,height,
      aspectWidth:width/aspect, aspectHeight:height/aspect,
      dataUrl:apiCanvas.toDataURL('image/jpeg',.78),
      flatBackgroundRemoved:flatBackground
    };
  } finally { bitmap.close(); }
}
