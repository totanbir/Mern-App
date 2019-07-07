const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const registerValidator = require('../validator/registerValidator')
const loginValidator = require('../validator/loginValidator')
const User = require('../model/User')
const {serverError, resourceError} = require('../util/error')

// login Controller
module.exports = {
	login(req, res) {
		let {email, password } = req.body
		let validate = loginValidator({ email, password })

		if(!validate.isValid){
			return res.status(400).json(validate.error)
		}

		User.findOne({ email })
			// Use Populate for transaction
			.then(user => {
				if(!user) {
					return resourceError(res, 'User Not Found')
				}
				bcrypt.compare(password, user.password, (err, result) => {
					if (err) {
						return serverError(res, err)
					}
					if (!result) {
						return resourceError(res, 'Password Does\'t Match')
					}

					let token = jwt.sign({
						_id: user._id,
						name: user.name,
						email: user.email,
						amount: user.amount,
						income: user.income,
						expense: user.expense,
						transactions: user.transactions
					}, 'SECRET', {expiresIn: '2h'})

					res.status(200).json({
						message: 'Login Successful',
						token: `Bearer ${token}`
					})
				})
			})
			.catch(error => serverError(res, error))
	},
	register(req, res) {
		// Read Client Data
		let { name, email, password, confirmPassword } = req.body
		let validate = registerValidator({ name, email, password, confirmPassword })

		// Validation check user data
		if(!validate.isValid){
			return res.status(400).json(validate.error)
		}else {
			User.findOne({ email })
				.then(user => {
					if(user) {
						return resourceError(res, 'Email Already Exist')
						
					}

					bcrypt.hash(password,11, (err,hash) => {
						if(err){
						return resourceError(res, 'server error Occurred')
						}
						let user = new User({
						name,
						email,
						password: hash
						})

						user.save()
							.then(user => {
								res.status(201).json({
									message: 'User Created Successfully',
									user
								})
							})
							.catch(error => serverError(res, error))
					})
				})
				.catch(error => serverError(res, error))
		}
		
		// check for duplicate user
		// new user object
		// save to database
		// response back with new data
	}
}