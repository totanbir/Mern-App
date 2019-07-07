const Transaction = require('../model/Transaction')
const User = require('../model/User')
const {serverError} = require('../util/error')

module.exports = {
	create(req, res){
		let { amount, note, type } = req.body
		let userId = req.user._id

		let transaction = new Transaction({
			amount, note, type, author: userId
		})

		transaction.save()
		.then(trans => {
			let updateUser = { ...req.user }
			if(type == 'income'){
				updateUser.balance = updateUser.balance + amount
				updateUser.income = updateUser.income + amount
			}else if(type == 'expense'){
				updateUser.balance = updateUser.balance - amount
				updateUser.expense = updateUser.expense + amount
			}
			updateUser.transactions.unshift(trans._id)
			User.findByIdAndUpdate(updatedUser._id, {$set: updateUser})
			res.status(201).json({
				message: 'Transaction created Successfully',
				... trans
			})
		})
		.catch(error => serverError(res, error))
	},
	getAll(req, res){
		Transaction.find()
		.then(transactions => {
			if(transactions.length == 0){
				res.status(200).json({
					message: 'No Transaction Found'
				})
			}else {
				res.status(200).json(transactions)
			}
		})
		.catch(error => serverError(res, error))
	},
	getSingleTransaction(req, res){
		let { transactionId } = req.params
		Transaction.findById(transactionId)
			.then(transaction => {
				if(!transaction){
					res.status(200).json({
						message: 'No Transaction Found'
					})
				}else {
					res.status(200).json(transaction)
				}
			})
			.catch(error => serverError(res, error))
	},
	update(req, res){
		let { transactionId } = req.params
		User.findByIdAndUpdate(transactionId, { $set: req.body })
			.then(result => {
				res.status(200).json({
					message: 'Updated Successfully',
					... result
				})
			})
			.catch(error => serverError(res. error))
	},
	remove(req, res){
		let { transactionId } = req.body
		User.findByIdAndRemove(transactionId)
			.then(result => {
				res.status(200).json({
					message: 'Deleted Successfully',
					... result
				})
			})
			.catch(error => serverError(res, error))
	}
}