import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filterUsers = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );

    res.status(200).json(filterUsers);
  } catch (error) {
    console.log("error in getUserForSidebar controller", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const getMessages = async(req,res) => {
    try {
       const { id : userToChat } = req.params;
       const myId =req.user._id ;

       const messages = await Message.find({
        $or:[
            {from:myId , to : userToChat} ,
            {from:userToChat , to : myId}
        ]
       })

       res.status(200).json(messages) ;
        
    } catch (error) {
        console.log("error in getMessages controller", error);
        return res.status(500).json({ message: "server error" });
        
    }
}

export const sendMessages = async(req,res)=> {
    try {
        const {text , image} = req.body ; 
        const {id : receiverId} = req.params ;
        const senderId = req.user._id ; 


        let imageUrl ;
        
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image) ; 
            imageUrl = uploadResponse.secure_url ;
        }



        const newMessage = new Message({
            senderId ,
            receiverId ,
            text ,
            image : imageUrl

        })

        await newMessage.save() ; 
        //todo : implement socket.io to send real time message

        res.status(201).json(newMessage) ; 

        
    } catch (error) {
        
    }
}