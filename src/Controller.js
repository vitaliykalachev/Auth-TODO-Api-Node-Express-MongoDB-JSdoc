const User = require("./models/User");
const Role = require("./models/Role");
const Todo = require("./models/Todo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { secret } = require("./config");

/**
 * @name Generate_Access_Token
 * @member {object}
 * @param {string} id
 * @param {string} roles
 */
const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};
/**
 * @class
 * @constructs Controller
 * @classdesc all CRUD methods
 * @property {authController.registration} registration Registration
 * @property {authController.login} login Login Authentication
 * @property {authController.getUsers} getUsers Get_All_Users
 * @property {authController.getTodos} getTodos Get_All_Todos
 * @property {authController.getOne} getOne Get_One_Todo
 * @property {authController.create} create Create_Todo
 * @property {authController.update} update Update_Todo
 * @property {authController.delete} delete Delete_Todo
 *
 */
class authController {
  /**
   *
   * @typedef {object} NewUser Array information of user that was created
   * @tags registration
   *
   * @property {string} username Username
   * @property {string} password Hashpassword
   * @property {object} roles Users Role. By default ["USER"]
   * @property {string} id Id number
   */

  /**
   *
   * @name Registration
   * @summary POST   /auth/registration
   * @description Registration of New User
   *
   * @async
   * @function
   * @param {array<User>} request Sent username and password in request.body
   * @param {array<NewUser>} response Take username, hashpassword, roles and Id
   * @return {array<NewUser>} 200 - success response - application/json
   * @return {string} 400 - Bad request response
   */

  async registration(request, response) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return response
          .status(400)
          .json({ message: "Registration Validation error", errors });
      }

      const { username, password } = request.body;

      const candidate = await User.findOne({ username });
      if (candidate) {
        return response.status(400).json({ message: "User already exists" });
      }

      const hashPassword = bcrypt.hashSync(password, 7);

      const userRole = await Role.findOne({ value: "USER" });

      const user = new User({
        username,
        password: hashPassword,
        roles: [userRole.value],
      });

      await user.save();

      return response.json(user);
    } catch (e) {
      response.status(400).json({ message: "Registration error" });
    }
  }
  /**
   * Token
   * @typedef {object} Token Token of Login User
   *
   * @property {string} token JWT Token
   */

  /**
   * @typedef {object} User Array information about User in request body
   * @property {string} username Username
   * @property {string} password Password
   */

  /**
   * @name Login Authentication
   * @summary POST   /auth/login
   * @description Login Authentication
   *
   * @async
   * @function
   * @param {array<User>} request sent User information in request body
   * @param {array<Token>} response Take JWT token
   *
   * @return {array<Token>} 200 - success response - application/json
   * @return {string} 400 - Bad request response
   */

  async login(request, response) {
    try {
    
      const { username, password } = request.body;
     
      const user = await User.findOne({ username });
      if (!user) {
        return response
          .status(400)
          .json({ message: "User " + username + " is not found" });
      }
      
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return response.status(400).json({ message: "Wrong password" });
      }
      
      const token = generateAccessToken(user._id, user.roles);
      return response.json({ token });
    } catch (e) {
      response.status(400).json({ message: "Login error" });
    }
  }
  /**
   * @typedef {object} AllUsers Array with All Users
   *
   * @property {array<User>}  User  One User Information
   */

  /**
   * @name Get_All_Users
   * @summary GET   /auth/users
   * @description Get all users from the database
   *
   * @async
   * @function
   * @param {request} request Sent request
   * @param {array<AllUsers>} response Array with all registered Users
   *
   * @return {array<AllUsers>} 200 - success response - application/json
   * @return {string} 400 - Bad request response
   */
  async getUsers(request, response) {
    try {
      const users = await User.find();
      return response.json({ users });
    } catch (e) {
      console.log(e);
      response.status(400).json({ message: "Bad request response" });
    }
  }

  /**
   * @typedef {object} Todo All infromation about one Todo
   *
   * @property {string} id Id of Todo
   * @property {string} title Title of Todo
   * @property {string} description Description of Todo
   */

  /**
   * @typedef {object} AllTodos Array with many Todos
   * @property {array<Todo>}  Todo  One Todo information
   */

  /**
   * @name Get_All_Todos
   * @summary GET   /auth/todo
   * @description Get all Todos from the database
   *
   * @async
   * @function
   * @param {request} request Sent request
   * @param {array<AllTodos>} response Array with all Todos
   *
   * @return {array<AllTodos>} 200 - success response - application/json
   * @return {string} 400 - Bad request response
   */

  async getTodos(request, response) {
    try {
      const todos = await Todo.find();
      return response.json({ todos });
    } catch (e) {
      response.status(400).json({ message: "Bad request response" });
    }
  }

  /**
   * @name Get_One_Todo
   * @summary GET   /auth/todo/:id
   * @description Get One Todo from the database
   *
   * @async
   * @function
   * @param {request} request Sent Id in request.params
   * @param {array<Todo>} response Array of one todo
   *
   * @return {array<Todo>} 200 - success response - application/json
   * @return {string} 400 - Bad request response
   */

  async getOne(request, response) {
    try {
     
      const { id } = request.params;
      if (!id) {
        response.status(400).json({ message: "Id not specified" });
      }
      
      const todo = await Todo.findById(id);
      if (!todo) {
        response.status(400).json({ message: "Item does not exists" });
      }
      return response.json({ todo });
    } catch (e) {
      response.status(400).json({ message: "Bad request response" });
    }
  }
  /**
   * @typedef {object} TodoCreate Create Schema for one Todo
   * @property {string} title example <"title": "This is Title">
   * @property {string} description example <"description": "this is description">
   */

  /**
   * @name Create_Todo
   * @summary POST    /auth/todo
   * @description Creating a new todo
   *
   * @async
   * @function
   * @param {array<TodoCreate>} request Sent information in request body
   * @param {array<Todo>} response Array of todo that was created
   *
   * @return {array<Todo>} 200 - success response - application/json
   * @return {string} 400 - Bad request response
   */

  async create(request, response) {
    try {
     
      const { title, description } = request.body;
     
      const todo = await Todo.create({ title, description });
      return response.json(todo);
    } catch (e) {
      response.status(400).json({ message: "Bad request response" });
    }
  }

  /**
   * @name Update_Todo
   * @summary PUT    /auth/todo
   * @description Updating an existing todo
   *
   * @async
   * @function
   * @param {array<Todo>} request Sent information in request body
   * @param {array<Todo>} response Array of todo that was Updated
   *
   * @return {array<Todo>} 200 - success response - application/json
   * @return {string} 400 - Bad request response
   */
  async update(request, response) {
    try {
     
      const todo = request.body;
      if (!todo._id) {
        response.status(400).json({ message: "Id not specified" });
      }
     
      const updatedTodo = await Todo.findByIdAndUpdate(todo._id, todo, {
        new: true,
      });
      if (!todo) {
        response.status(400).json({ message: "Item does not exists" });
      }

      return response.json(updatedTodo);
    } catch (e) {
      response.status(400).json({ message: "Bad request response" });
    }
  }

  /**
   * @name Delete_Todo
   * @summary  DELETE    /auth/todo/:id
   * @description Deleting todo by id
   *
   * @async
   * @function
   * @param {request} request Sent Id in request.params
   * @param {array<Todo>} response Array of todo that was Deleted
   *
   * @return {array<Todo>} 200 - success response - application/json
   * @return {string} 400 - Bad request response
   */
  async delete(request, response) {
    try {
      const { id } = request.params;
      if (!id) {
        response.status(400).json({ message: "Id not specified" });
      }

      
      const todo = await Todo.findByIdAndDelete(id);
      if (!todo) {
        response.status(400).json({ message: "Item does not exists" });
      }
      return response.json(todo);
    } catch (e) {
      response.status(400).json({ message: "Bad request response" });
    }
  }
}

module.exports = new authController();
