
let pathParams = (splat, ext) => {
	ext = '.' + ext;

	let title = splat,
      idx1 = title.lastIndexOf('/'),
      idx2 = title.indexOf(ext),
      folder = title.substring(0, idx1);

    if(idx2 == -1) {
    	idx2 = title.length;
    	title += ext;
    }

    name = title.substring(idx1+1, idx2);

    return {
    	title,
    	folder,
    	name
    }
};

export { pathParams }
