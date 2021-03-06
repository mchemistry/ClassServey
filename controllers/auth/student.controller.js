var passport = require('passport');
const Student = require('../../models/auth/student')
const validInput = require('../../libs/validate')
module.exports = {
    signUp : async (req, res, next) =>{
        await passport.authenticate('student-signup', (err, user, info) => {
            if(err){
                let err = new Error(`${err}`)
                err.statusCode = 400
                return next(err)
            }
            else {
                res.status(200).json(info)
            }
        })(req, res, next)
    },
    logIn: async(req, res, next) => {
        await passport.authenticate('student-login',(err, user, info) =>{
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
    removeStudent: async(req, res, next) =>{
        await Student.findByIdAndRemove(req.params.id, (err,data) =>{
            if(!validInput.isID(req.params.id)){
                let err = new Error('Params is not a mongoose Id!')
                err.statusCode = 422
                return next(err)
            }
            else if(err)
                return next(err)
            res.status(200).json({
                success: true,
                message: `Deleted user id: ${req.params.id} !`
            })
        })
    },
    updateStudent: async(req, res, next) => {
        if(!validInput.isID(req.params.id)){
            let err = new Error('Params is not a mongoose Id!')
            err.statusCode = 422
            return next(err)
        }
        await Student.findOne({_id : req.params.id}, (err, user) =>{
           if(err){
                return next(err)
            }
            else if(!user){
                let err = new Error(` Không tìm thấy user với id ${req.params.id}!`)
                err.statusCode = 404
                return next(err)
            }
            if(req.body.fullName !== undefined){
                if(!validInput.isFullName(req.body.fullName)){
                    return res.status(422).json({
                        success: false,
                        message: 'Họ và tên sai định dạng!'
                    })
                }
               user.fullName = req.body.fullName
               user.firstCharOfLastName = user.getFirstCharOfLastName(req.body.fullName)
            }
            if(req.body.cardID !== undefined){
                var check = validInput.isCardID(_.trim(req.body.cardID))
                if(!check){
                    return res.status(422).json({
                        success: false,
                        message: `Invalid cardId!`
                    })
                }
            }
            if(req.body.course !== undefined){
                user.course = req.body.course
            }
            user.save(err => {
                if(err)
                    return next(err)
                return  res.status(200).json({
                    success: true,
                    message: `User id ${req.params.id} has been updated!`
                })
            })
           
        })
    },
    getAllStudent: async(req, res, next) =>{
        var page = req.query.page
        var limit = req.query.limit
        if(!validInput.isValidPageAndLimit(page, limit)){
            let err = new Error('Invalid query page or limit!')
            err.statusCode = 422
            return next(err)
        }
        var validPage = Math.max(0, parseInt(page)-1)

        Student.find()
            .limit(parseInt(limit))
            .skip(validPage*10)
            .sort({'firstCharOfLastName' : 1})
            .exec((err, data) => {
                if(err)
                    return 
                else return res.status(200).json({
                    success: false,
                    data
                })
            })
    },
    changePasswordStudent: async(req,res, next)=>{
        if(!validInput.isValidPassword(req.body.password)){
            return res.status(422).json({
                success: false,
                message: 'Invalid password!'
            })
        }
        else if(!validInput.isID(req.params.id)){
            let err = new Error('Params is not a mongoose Id!')
            err.statusCode = 422
            return next(err)
        }
        await Student.findById(req.params.id, (err,student) => {
            if(err)
                return next(err)
            else if(!student){
                return res.status(404).json({
                    success: false,
                    message: `Not found id ${req.params.id}`
                })
            }
            else{
                student.password = student.generateHash(req.body.password)
                student.save((err)=>{
                    if(err)
                        return next(err)
                    return res.status(200).json({
                        success:true,
                        message: `Student id ${req.params.id} updated password!`
                    })
                })
            }
        })
    }
}