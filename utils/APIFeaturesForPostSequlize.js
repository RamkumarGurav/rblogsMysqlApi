// The main difference between the two methods is that find() returns a single instance (one row) that matches the criteria, while findAll() returns an array of all instances (rows) that meet the conditions.
//when Sequelize we can't chain findAll().findAll() like this due to this we can't chain filter ,sort ..etc methods like we do in mongodb

const { Op, fn, col } = require("sequelize");
const db = require("../models");
const User = db.users;

class APIFeaturesForPostSequlize {
  constructor(model, queryObject) {
    //in sequelize we can only pass model as parameter (we cant pass whole query as parameter like model.findAll())
    this.query = model;
    this.queryObject = queryObject;
  }

  filter_Sort_LimitFields_Search() {
    //----------Advance filtering--------------------------
    // 1a) Filtering
    const queryObj = { ...this.queryObject };
    const excludedFields = ["sort", "page", "limit", "fields", "keyword"];
    excludedFields.forEach((field) => delete queryObj[field]);

    console.log("queryObj", queryObj);
    // 1b) Advanced filtering using gte, gt, lte, lt
    //   // eg1-: http://localhost:3000/api/v1/users?age=18
    //   //req.query object will be  {age:18}
    //   //we need in sequelize ,const users = await User.findAll({where:{ age: 18 } });
    //   //so,const users = await User.find(req.query);
    //   // eg1-: http://localhost:3000/api/v1/users?age[gte]=18&ratings[lte]=4
    //   // req.query object will be is {age:{gte :18},ratings:{lte:4}}
    //   //we need in sequelize, const users = await User.findAll({where:{ age: { [Op.gte]: 18 },ratings:{[Op.lte]:4} } });
    //   //here we need to convert  gt,gte,lt and lte to [Op.gt],[Op.gte],[Op.lt],[Op.lte],of  req.query object then we can use in User.findAll({where:{...req.query}}) like this
    // // eg. const usersAbove18 = await User.findAll({
    //   where: {
    //     age: {
    //       [Op.gte]: 18,
    //     },
    //     ratings: {
    //       [Op.lte]: 4,
    //     },
    //   },
    // });

    for (const key in queryObj) {
      // key is age and ratings
      // console.log(Object.keys(queryObj[key]));
      if (Object.keys(queryObj[key])[0] === "gt") {
        const value = queryObj[key].gt;
        queryObj[key] = { [Op.gt]: value };
      } else if (Object.keys(queryObj[key])[0] === "gte") {
        const value = queryObj[key].gte;
        queryObj[key] = { [Op.gte]: value };
      } else if (Object.keys(queryObj[key])[0] === "lt") {
        const value = queryObj[key].lt;
        queryObj[key] = { [Op.lt]: value };
      } else if (Object.keys(queryObj[key])[0] === "lte") {
        const value = queryObj[key].lte;
        queryObj[key] = { [Op.lte]: value };
      }
    }
    // console.log(Object.keys(queryObj).length);

    //----------sorting--------------------------
    const { sort } = this.queryObject;
    let sortBy = [];
    if (sort) {
      sortBy = sort.split(",").map((field) => {
        if (field.startsWith("-")) {
          return [field.substring(1), "DESC"];
        } else {
          return [field, "ASC"];
        }
      });
    } else {
      sortBy = [["createdAt", "DESC"]];
    }

    //------------------limitFields-----------
    //how include fields - User.findAll({ attributes: ["title","subtitle","description"] })
    //how exlude fields -User.findAll({ attributes:{exlude:['email','updatedAt']} })
    //how to both include and exclude feilds- User.findAll({ attributes: ['name', 'email'],exclude: ['age'],})
    //if I want only title,subtitle and description in each post of results then
    //eg1-: http://localhost:3000/api/v1/users?fields=title,subtitle,description
    // for this req.query.fields give output="title,subtitle,description"
    //how we selcect certain fields
    //const users = await User.findAll({ attributes: ["title","subtitle","description"] });

    let incFieldsArr = [];
    let excFieldsArr = [];
    if (this.queryObject.fields) {
      //creating array of arrays

      this.queryObject.fields.split(",").forEach((field) => {
        if (field.startsWith("-")) {
          // For descending order //if field is '-price' then field.substring(1) gives 'price' (starting at index 1 to the last)//here we convert each field into array like ["price","DESC"]
          excFieldsArr.push(field.substring(1));
        } else {
          incFieldsArr.push(field);
        }
      });
    }

    // Searching logic...
    // Pagination logic...

    //----------Searching--------------------------
    const searchQueryObj = this.queryObject.keyword
      ? {
          title: {
            [Op.like]: fn("LOWER", `%${this.queryObject.keyword}%`),
          },
        }
      : {};

    //--------------------------------------------------------
    this.query = this.query.findAll({
      where: { ...queryObj, ...searchQueryObj },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email", "avatar"],
        },
      ],
      order: [...sortBy],
      attributes:
        incFieldsArr.length > 0
          ? [...incFieldsArr]
          : { exclude: [...excFieldsArr] },
    });

    return this;
  }
  my_Filter_Sort_LimitFields_Search(userId) {
    //----------Advance filtering--------------------------
    // 1a) Filtering
    const queryObj = { ...this.queryObject };
    const excludedFields = ["sort", "page", "limit", "fields", "keyword"];
    excludedFields.forEach((field) => delete queryObj[field]);

    console.log("queryObj", queryObj);
    // 1b) Advanced filtering using gte, gt, lte, lt
    //   // eg1-: http://localhost:3000/api/v1/users?age=18
    //   //req.query object will be  {age:18}
    //   //we need in sequelize ,const users = await User.findAll({where:{ age: 18 } });
    //   //so,const users = await User.find(req.query);
    //   // eg1-: http://localhost:3000/api/v1/users?age[gte]=18&ratings[lte]=4
    //   // req.query object will be is {age:{gte :18},ratings:{lte:4}}
    //   //we need in sequelize, const users = await User.findAll({where:{ age: { [Op.gte]: 18 },ratings:{[Op.lte]:4} } });
    //   //here we need to convert  gt,gte,lt and lte to [Op.gt],[Op.gte],[Op.lt],[Op.lte],of  req.query object then we can use in User.findAll({where:{...req.query}}) like this
    // // eg. const usersAbove18 = await User.findAll({
    //   where: {
    //     age: {
    //       [Op.gte]: 18,
    //     },
    //     ratings: {
    //       [Op.lte]: 4,
    //     },
    //   },
    // });

    for (const key in queryObj) {
      // key is age and ratings
      // console.log(Object.keys(queryObj[key]));
      if (Object.keys(queryObj[key])[0] === "gt") {
        const value = queryObj[key].gt;
        queryObj[key] = { [Op.gt]: value };
      } else if (Object.keys(queryObj[key])[0] === "gte") {
        const value = queryObj[key].gte;
        queryObj[key] = { [Op.gte]: value };
      } else if (Object.keys(queryObj[key])[0] === "lt") {
        const value = queryObj[key].lt;
        queryObj[key] = { [Op.lt]: value };
      } else if (Object.keys(queryObj[key])[0] === "lte") {
        const value = queryObj[key].lte;
        queryObj[key] = { [Op.lte]: value };
      }
    }
    // console.log(Object.keys(queryObj).length);

    //----------sorting--------------------------
    const { sort } = this.queryObject;
    let sortBy = [];
    if (sort) {
      sortBy = sort.split(",").map((field) => {
        if (field.startsWith("-")) {
          return [field.substring(1), "DESC"];
        } else {
          return [field, "ASC"];
        }
      });
    } else {
      sortBy = [["createdAt", "DESC"]];
    }

    //------------------limitFields-----------
    //how include fields - User.findAll({ attributes: ["title","subtitle","description"] })
    //how exlude fields -User.findAll({ attributes:{exlude:['email','updatedAt']} })
    //how to both include and exclude feilds- User.findAll({ attributes: ['name', 'email'],exclude: ['age'],})
    //if I want only title,subtitle and description in each post of results then
    //eg1-: http://localhost:3000/api/v1/users?fields=title,subtitle,description
    // for this req.query.fields give output="title,subtitle,description"
    //how we selcect certain fields
    //const users = await User.findAll({ attributes: ["title","subtitle","description"] });

    let incFieldsArr = [];
    let excFieldsArr = [];
    if (this.queryObject.fields) {
      //creating array of arrays

      this.queryObject.fields.split(",").forEach((field) => {
        if (field.startsWith("-")) {
          // For descending order //if field is '-price' then field.substring(1) gives 'price' (starting at index 1 to the last)//here we convert each field into array like ["price","DESC"]
          excFieldsArr.push(field.substring(1));
        } else {
          incFieldsArr.push(field);
        }
      });
    }

    // Searching logic...
    // Pagination logic...

    //----------Searching--------------------------
    const searchQueryObj = this.queryObject.keyword
      ? {
          title: {
            [Op.like]: fn("LOWER", `%${this.queryObject.keyword}%`),
          },
        }
      : {};

    //--------------------------------------------------------
    this.query = this.query.findAll({
      where: { ...queryObj, ...searchQueryObj, userId: userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email", "avatar"],
        },
      ],
      order: [...sortBy],
      attributes:
        incFieldsArr.length > 0
          ? [...incFieldsArr]
          : { exclude: [...excFieldsArr] },
    });

    return this;
  }

  filter_Sort_LimitFields_Search_Paginate(resultsPerPage) {
    //----------Advance filtering--------------------------
    // 1a) Filtering
    const queryObj = { ...this.queryObject };
    const excludedFields = ["sort", "page", "limit", "fields", "keyword"];
    excludedFields.forEach((field) => delete queryObj[field]);

    console.log("queryObj", queryObj);
    // 1b) Advanced filtering using gte, gt, lte, lt
    //   // eg1-: http://localhost:3000/api/v1/users?age=18
    //   //req.query object will be  {age:18}
    //   //we need in sequelize ,const users = await User.findAll({where:{ age: 18 } });
    //   //so,const users = await User.find(req.query);
    //   // eg1-: http://localhost:3000/api/v1/users?age[gte]=18&ratings[lte]=4
    //   // req.query object will be is {age:{gte :18},ratings:{lte:4}}
    //   //we need in sequelize, const users = await User.findAll({where:{ age: { [Op.gte]: 18 },ratings:{[Op.lte]:4} } });
    //   //here we need to convert  gt,gte,lt and lte to [Op.gt],[Op.gte],[Op.lt],[Op.lte],of  req.query object then we can use in User.findAll({where:{...req.query}}) like this
    // // eg. const usersAbove18 = await User.findAll({
    //   where: {
    //     age: {
    //       [Op.gte]: 18,
    //     },
    //     ratings: {
    //       [Op.lte]: 4,
    //     },
    //   },
    // });

    for (const key in queryObj) {
      // key is age and ratings
      // console.log(Object.keys(queryObj[key]));
      if (Object.keys(queryObj[key])[0] === "gt") {
        const value = queryObj[key].gt;
        queryObj[key] = { [Op.gt]: value };
      } else if (Object.keys(queryObj[key])[0] === "gte") {
        const value = queryObj[key].gte;
        queryObj[key] = { [Op.gte]: value };
      } else if (Object.keys(queryObj[key])[0] === "lt") {
        const value = queryObj[key].lt;
        queryObj[key] = { [Op.lt]: value };
      } else if (Object.keys(queryObj[key])[0] === "lte") {
        const value = queryObj[key].lte;
        queryObj[key] = { [Op.lte]: value };
      }
    }
    // console.log(Object.keys(queryObj).length);

    //----------sorting--------------------------
    const { sort } = this.queryObject;
    let sortBy = [];
    if (sort) {
      sortBy = sort.split(",").map((field) => {
        if (field.startsWith("-")) {
          return [field.substring(1), "DESC"];
        } else {
          return [field, "ASC"];
        }
      });
    } else {
      sortBy = [["createdAt", "DESC"]];
    }

    //------------------limitFields-----------
    //how include fields - User.findAll({ attributes: ["title","subtitle","description"] })
    //how exlude fields -User.findAll({ attributes:{exlude:['email','updatedAt']} })
    //how to both include and exclude feilds- User.findAll({ attributes: ['name', 'email'],exclude: ['age'],})
    //if I want only title,subtitle and description in each post of results then
    //eg1-: http://localhost:3000/api/v1/users?fields=title,subtitle,description
    // for this req.query.fields give output="title,subtitle,description"
    //how we selcect certain fields
    //const users = await User.findAll({ attributes: ["title","subtitle","description"] });

    let incFieldsArr = [];
    let excFieldsArr = [];
    if (this.queryObject.fields) {
      //creating array of arrays

      this.queryObject.fields.split(",").forEach((field) => {
        if (field.startsWith("-")) {
          // For descending order //if field is '-price' then field.substring(1) gives 'price' (starting at index 1 to the last)//here we convert each field into array like ["price","DESC"]
          excFieldsArr.push(field.substring(1));
        } else {
          incFieldsArr.push(field);
        }
      });
    }

    // Searching logic...
    // Pagination logic...

    //----------Searching--------------------------
    const searchQueryObj = this.queryObject.keyword
      ? {
          title: {
            [Op.like]: fn("LOWER", `%${this.queryObject.keyword}%`),
          },
        }
      : {};

    //--------------paginate--------------
    const page = this.queryObject.page * 1 || 1;
    const limit = resultsPerPage * 1;
    const offset = (page - 1) * limit;

    //--------------------------------------------------------
    this.query = this.query.findAll({
      where: { ...queryObj, ...searchQueryObj },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email", "avatar"],
        },
      ],
      order: [...sortBy],
      attributes:
        incFieldsArr.length > 0
          ? [...incFieldsArr]
          : { exclude: [...excFieldsArr] },
      offset: offset,
      limit: limit,
    });

    return this;
  }
  my_Filter_Sort_LimitFields_Search_Paginate(resultsPerPage, userId) {
    //----------Advance filtering--------------------------
    // 1a) Filtering
    const queryObj = { ...this.queryObject };
    const excludedFields = ["sort", "page", "limit", "fields", "keyword"];
    excludedFields.forEach((field) => delete queryObj[field]);

    console.log("queryObj", queryObj);
    // 1b) Advanced filtering using gte, gt, lte, lt
    //   // eg1-: http://localhost:3000/api/v1/users?age=18
    //   //req.query object will be  {age:18}
    //   //we need in sequelize ,const users = await User.findAll({where:{ age: 18 } });
    //   //so,const users = await User.find(req.query);
    //   // eg1-: http://localhost:3000/api/v1/users?age[gte]=18&ratings[lte]=4
    //   // req.query object will be is {age:{gte :18},ratings:{lte:4}}
    //   //we need in sequelize, const users = await User.findAll({where:{ age: { [Op.gte]: 18 },ratings:{[Op.lte]:4} } });
    //   //here we need to convert  gt,gte,lt and lte to [Op.gt],[Op.gte],[Op.lt],[Op.lte],of  req.query object then we can use in User.findAll({where:{...req.query}}) like this
    // // eg. const usersAbove18 = await User.findAll({
    //   where: {
    //     age: {
    //       [Op.gte]: 18,
    //     },
    //     ratings: {
    //       [Op.lte]: 4,
    //     },
    //   },
    // });

    for (const key in queryObj) {
      // key is age and ratings
      // console.log(Object.keys(queryObj[key]));
      if (Object.keys(queryObj[key])[0] === "gt") {
        const value = queryObj[key].gt;
        queryObj[key] = { [Op.gt]: value };
      } else if (Object.keys(queryObj[key])[0] === "gte") {
        const value = queryObj[key].gte;
        queryObj[key] = { [Op.gte]: value };
      } else if (Object.keys(queryObj[key])[0] === "lt") {
        const value = queryObj[key].lt;
        queryObj[key] = { [Op.lt]: value };
      } else if (Object.keys(queryObj[key])[0] === "lte") {
        const value = queryObj[key].lte;
        queryObj[key] = { [Op.lte]: value };
      }
    }
    // console.log(Object.keys(queryObj).length);

    //----------sorting--------------------------
    const { sort } = this.queryObject;
    let sortBy = [];
    if (sort) {
      sortBy = sort.split(",").map((field) => {
        if (field.startsWith("-")) {
          return [field.substring(1), "DESC"];
        } else {
          return [field, "ASC"];
        }
      });
    } else {
      sortBy = [["createdAt", "DESC"]];
    }

    //------------------limitFields-----------
    //how include fields - User.findAll({ attributes: ["title","subtitle","description"] })
    //how exlude fields -User.findAll({ attributes:{exlude:['email','updatedAt']} })
    //how to both include and exclude feilds- User.findAll({ attributes: ['name', 'email'],exclude: ['age'],})
    //if I want only title,subtitle and description in each post of results then
    //eg1-: http://localhost:3000/api/v1/users?fields=title,subtitle,description
    // for this req.query.fields give output="title,subtitle,description"
    //how we selcect certain fields
    //const users = await User.findAll({ attributes: ["title","subtitle","description"] });

    let incFieldsArr = [];
    let excFieldsArr = [];
    if (this.queryObject.fields) {
      //creating array of arrays

      this.queryObject.fields.split(",").forEach((field) => {
        if (field.startsWith("-")) {
          // For descending order //if field is '-price' then field.substring(1) gives 'price' (starting at index 1 to the last)//here we convert each field into array like ["price","DESC"]
          excFieldsArr.push(field.substring(1));
        } else {
          incFieldsArr.push(field);
        }
      });
    }

    // Searching logic...
    // Pagination logic...

    //----------Searching--------------------------
    const searchQueryObj = this.queryObject.keyword
      ? {
          title: {
            [Op.like]: fn("LOWER", `%${this.queryObject.keyword}%`),
          },
        }
      : {};

    //--------------paginate--------------
    const page = this.queryObject.page * 1 || 1;
    const limit = resultsPerPage * 1;
    const offset = (page - 1) * limit;

    //--------------------------------------------------------
    this.query = this.query.findAll({
      where: { ...queryObj, ...searchQueryObj, userId: userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email", "avatar"],
        },
      ],
      order: [...sortBy],
      attributes:
        incFieldsArr.length > 0
          ? [...incFieldsArr]
          : { exclude: [...excFieldsArr] },
      offset: offset,
      limit: limit,
    });

    return this;
  }
}

module.exports = APIFeaturesForPostSequlize;
