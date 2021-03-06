var db = require("../model/index");
import BaseCRUDRepository from './base-crud-repository';

class ConfigRepository extends BaseCRUDRepository {
  constructor() {
    super();
    this.model = db.configs;
    this.createFields = ['contextType', 'contextMapping', 'metadata'];
    this.updateFields = ['contextType', 'contextMapping', 'metadata'];
  }

  findAllCountAllByContextType(contextType) {
    return this.model.findAndCountAll({
      where:{
        contextType: contextType,
      },
      order: [['createdAt', 'DESC']],
      // offset: options.pagination.offset,
      // limit: options.pagination.limit
    });
  }
}

export default new ConfigRepository();