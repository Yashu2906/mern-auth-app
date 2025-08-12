
const userModel = require('../models/user.model')

module.exports.getUserData = async(req,res)=>{
    
    try{
        const userId = req.userId;
        const user = await userModel.findById(userId);

        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        res.json({
            success:true,
            userData:{name:user.name,
                isAccountVerified:user.isAccountVerified
            }
        })

    }
    catch(error){
        res.json({success : false, message:error.message})
    }

}