export class FilterUtil {
	
	static quickFilter(data, keyword) {
		keyword = keyword.toLowerCase();
		return data.filter(d => JSON.stringify(d).toLowerCase().includes(keyword));
	}
	

  /*
    filterSettings = {
      filterKey: 'search keyword'
      filterProperties: ['property1', 'property2', 'property3', ...]
    }
  */
  static filter(filterSettings, data) {
    filterSettings.filterKey = filterSettings.filterKey.toLowerCase();
    filterSettings.filterProperties = filterSettings.filterProperties.map(p => p.toLowerCase());
    return data.filter(d => {
      let check = true;
      for (const property of filterSettings.filterProperties) {
        check = d[property].toLowerCase().indexOf(filterSettings.filterKey) !== -1;
        if (check) {
          break;
        }
      }
      return check;
    });
  }

  /*
    filterSettings = [
      {filterKey: 'search key 1', filterProperty: 'property 1'},
      {filterKey: 'search key 2', filterProperty: 'property 2'}
    ]
  */
  static multiFilter(filterSettings, data, andFilter= false) {
    return data.filter(d => {
      let check = true;
      for (const settings of filterSettings) {
        check = d[settings.filterProperty].toLowerCase().indexOf(settings.filterKey) !== -1;
        if (!andFilter && check) {
          break;
        }
      }
      return check;
    });
  }
}
