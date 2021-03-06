var passport = require('passport')
const Admin = require('../../models/auth/admin')
const config = require('../../configs/config')
const mongoose = require('mongoose')
const _ = require('lodash')
const validInput  = require('../../libs/validate')
module.exports = {
    signUp: async (req, res, next) => {
        await passport.authenticate('admin-signup', (err, user, info) => {
            if(err){
                let err = new Error(`${err}`)
                err.statusCode = 400
                return next(err)
            }
            else{
                res.status(200).json(info)
            }
        })(req, res, next)
    },
    logIn: async (req, res, next) => {
        await passport.authenticate('admin-login', (err, user, info) => {
            if(err){
                let err = new Error(`${err}`)
                err.statusCode = 400
                return next(err)
            }
            else if(!user){
                return res.status(404).json(info)
            }
            else{
                req.login(user, (err) => {
                    if(err)
                        return next(err)
                    return res.status(200).json(info)
                })
            }
        })(req, res, next)
    },
    removeAdmin: async (req, res, next) => {
        var realID  = _.replace(_.trim(req.params.id),config.SECRET_TOKEN,'')
        let checkToken = config.isIncludesSecretToken(req.params.id)
        if(!checkToken){
            let err = new Error('Params is missing token!')
            err.statusCode = 422
            return next(err)
        }
        else{
            await Admin.findByIdAndRemove(mongoose.Types.ObjectId(realID), (err,data) => {
                if(!validInput.isID(req.params.id)){
                    let error = new Error('Params is not a mongoose Id!')
                    error.statusCode = 422
                    return next(error)
                }
                else if(err){
                    return next(err)  
                }
                return res.status(200).json({
                    success: true,
                    message: `Admin id: ${realID} has been removed!`
                })
            })
        }
    }
}