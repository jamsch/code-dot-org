type Asset = {
  filename: string;
};

let assets: Asset[] = [];

export default {
  reset(list: Asset[]) {
    assets = list.slice();
    return assets;
  },

  add(asset: Asset) {
    assets = this.remove(asset.filename);
    assets.unshift(asset);
    return assets.slice();
  },

  remove(filename: string) {
    assets = assets.filter(asset => asset.filename !== filename);
    return assets.slice();
  },

  /**
   * @param allowedExtensions - The allowed extensions to filter the assets by (e.g. ".mp3")
   */
  list(allowedExtensions: string) {
    if (!allowedExtensions) {
      return assets.slice();
    }
    return assets.filter(asset => {
      const match = asset.filename.toLowerCase().match(/\.[^.]+$/);
      if (match) {
        const extension = match[0];
        return allowedExtensions.split(', ').indexOf(extension) > -1;
      }
    });
  },
};
