/**
 * @module authRouter [All routers]
 */

const Router = require('express')


const router = new Router()
const controller = require('./authController')
const {check} = require('express-validator')


const authMiddleware = require('./middlewaree/authMiddleware')
const roleMiddleware = require('./middlewaree/roleMiddleware')



router.post('/registration', [
    check('username', 'Username cannot be empty').notEmpty(),
    check('password', 'Password must be longer than 4 and shorter than 10 characters').isLength({min:4, max:10})
], controller.registration)
router.post('/login', controller.login)
router.get('/users', roleMiddleware(['USER']), controller.getUsers)

router.get('/todo', authMiddleware, controller.getTodos)
router.get('/todo/:id', authMiddleware, controller.getOne)

router.post('/todo', authMiddleware, controller.create)
router.put('/todo', authMiddleware, controller.update)
router.delete('/todo/:id', authMiddleware, controller.delete)



module.exports = router