const User = require("./models/User");
const Role = require("./models/Role");
const Todo = require("./models/Todo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { secret } = require("./config");

/**
 *
 * @param {string} id
 * @param {string} roles
 * @returns
 */
const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};
/**
 * @class all methods
 */
class authController {
  /**
   *
   * @typedef {object} NewUser
   * @tags registration
   *
   * @property {string} username
   * @property {string} password
   * @property {object} roles
   * @property {string} id
   */

  /**
   *
   * (POST /auth/registration)
   * @summary Registration of New User
   *
   * @async
   * @function
   * @param {array<User>} request
   * @param {string} response
   * @return {array<NewUser>} 200 - success response - application/json
   * @return {string} 400 - Bad request response
   */
  async registration(request, response) {
    try {
      /**
       * Validation
       */
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return response
          .status(400)
          .json({ message: "Registration Validation error", errors });
      }
      /**
       * Get username and password from request body
       */
      const { username, password } = request.body;
      /**
       * Database comparison.
       * Does such a user exist in the database?
       */
      const candidate = await User.findOne({ username });
      if (candidate) {
        return response.status(400).json({ message: "User already exists" });
      }
      /**
       * Password hashing
       */
      const hashPassword = bcrypt.hashSync(password, 7);
      /**
       * Default role - "USER".
       * To create an admin, you need to change "USER" to "ADMIN"
       */
      const userRole = await Role.findOne({ value: "USER" });
      /**
       * New user details
       */
      const user = new User({
        username,
        password: hashPassword,
        roles: [userRole.value],
      });
      /**
       * Saving the user to the database
       */
      await user.save();
      /**
       * Response with data about the saved User
       * @
       */
      return response.json(user);
    } catch (e) {
      response.status(400).json({ message: "Registration error" });
    }
  }
  /**
   * Token
   * @typedef {object} Token
   *
   * @property {string} token
   */

  /**
   * @typedef {object} User
   * @property {string} username
   * @property {string} password
   */
  /**
   * (POST /auth/login)
   * @summary Login Authentication
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
      /**
       * Get username and password from request body
       */
      const { username, password } = request.body;
      /**
       * Database comparison.
       * Does such a user exist in the database?
       */
      const user = await User.findOne({ username });
      if (!user) {
        return response
          .status(400)
          .json({ message: "User " + username + " is not found" });
      }
      /**
       * Comparing the entered password with the password in the database
       */
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return response.status(400).json({ message: "Wrong password" });
      }
      /**
       * Generation and receipt of Token for user id and user role
       */
      const token = generateAccessToken(user._id, user.roles);
      return response.json({ token });
    } catch (e) {
      response.status(400).json({ message: "Login error" });
    }
  }
 /**
  * @typedef {object} AllUsers Array with All Users
  * 
  * @property {array<User>}  User One User
  */

  /**
   * (GET /auth/users)
   * @summary Get all users from the database
   *
   * @async
   * @function
   * @param {request} request
   * @param {array<AllUsers>} response Array with all registered Users
   * 
   * @return {array<AllUsers>} 200 - success response - application/json
   * @return {string} 400 - Bad request response
   */
  async getUsers(request ,response) {
    try {
      const users = await User.find();
      return response.json({ users });
    } catch (e) {
      console.log(e);
      response.status(400).json({ message: "Bad request response" });
    }
  }
  
  /**
   * @typedef {object} Todo
   * 
   * @property {string} id
   * @property {string} title
   * @property {string} description
   */

   /**
  * @typedef {object} AllTodos Many Todos
  * @property {array<Todo>}  Todo  One Todo
  */

  /**
   * (GET /auth/todo)
   * @summary Get all Todos from the database
   *
   * @async
   * @function
   * @param {request} request 
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
   * (GET /auth/todo/:id)
   * @summary Get One Todo from the database
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
      /**
       * Sent id of todo in request.params
       */
      const { id } = request.params;
      if (!id) {
        response.status(400).json({ message: "Id not specified" });
      }
      /**
       * Finding the todo by id in the database and return it in the response
       */
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
   * @typedef {object} TodoCreate
   * @property {string} title example <"title": "This is Title">
   * @property {string} description example <"description": "this is description">
   */

  /**
   *
   * @typedef {object} NewUser
   * @tags registration
   *
   * @property {string} username
   * @property {string} password
   * @property {object} roles
   * @property {string} id
   */
    /**
   * (POST /auth/todo/)
   * @summary Creating a new todo
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
      /**
       * Sent title and description of todo in request body
       *
       */
      const { title, description } = request.body;
      /**
       * Creating a new todo in the database and return it in the response
       */
      const todo = await Todo.create({ title, description });
      return response.json(todo);
    } catch (e) {
      response.status(400).json({ message: "Bad request response" });
    }
  }
  
   /**
   * (PUT /auth/todo)
   * @summary Updating an existing todo
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
      /**
       * Sent id, title and description of todo in request body
       *
       */
      const todo = request.body;
      if (!todo._id) {
        response.status(400).json({ message: "Id not specified" });
      }
      /**
       * Finding the todo by id in the database and Updating.
       * Then return updated todo in the response
       *
       */
      
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
   * (DELETE /auth/todo/:id)
   * @summary Deleting todo by id
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
      /**
       * Finding the todo by id in the database and Deleting it.
       * Then return deleted todo in the response
       */
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
