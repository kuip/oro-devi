
let pathParams = (splat, ext) => {
  let title = splat,
      idx1 = title.lastIndexOf('/'),
      idx2 = title.lastIndexOf('.'),
      folder = title.substring(0, idx1);

  if(idx2 == -1 && ext) {
    idx2 = title.length;
    ext = '.' + ext;
    title += ext;
  }
  else if(idx2 >= 0) {
    ext = title.substring(idx2);
  }
  else {
    return {
      title,
      folder: title,
    }
  }

  let name = title.substring(idx1+1, idx2);

  return {
  	title,
  	folder,
  	name
  }
};

export { pathParams }
