import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Tenant } from "../models/tenant.model.js";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    console.log(req.body);
    
    const {name, email, password,companyName,companySlug,plan } = req.body
    //console.log("email: ", email);

    if (
        [name, email, password,companyName,companySlug,plan].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    
    
   

    const user = await User.create({
        name,
        isAdmin:true,
        email, 
        password,
        companyName,
        companySlug,
        plan
    })

    



    
    const tenant =await Tenant.create({
        createdby:user._id,
        name:companyName,
        slug:companySlug,
        plan,
    })

    if (!tenant) {
    throw new ApiError(500, "Something went wrong while creating the tenant");
  }


  user.tenant = tenant._id;
  await user.save();

  const createdUser = await User.findById(user._id).select("-password -refreshToken");


    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, password} = req.body
    console.log(email);

    if (!email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [ {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const tenant=await Tenant.findById(loggedInUser.tenant)
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        {
            msg:'logged Successfully',
            accessToken:accessToken,
            User:loggedInUser,
            tenant
        }
    )

})


const me= asyncHandler(async (req,res)=>{
    const myself = await User.findById(req.user._id).select("-password -refreshToken")
    const tenant = await Tenant.findById(myself.tenant)
    return res
    .status(200)
    .json(
        {
            msg:'logged Successfully',
            User:myself,
            tenant
        }
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});



// const createNote=asyncHandler(async(req,res)=>{

//     console.log(req.body);


// })


import { Note } from "../models/notes.model.js";

// ✅ Create Note
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    // check tenant
    const tenant = await Tenant.findById(req.user.tenant);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // enforce free plan limit
    if (tenant.plan === "free" && tenant.noteCount >= 3) {
      return res
        .status(403)
        .json({ message: "You reached the free plan limit. Please upgrade your plan." });
    }

    // validate input
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // create note
    const note = await Note.create({
      title,
      content,
      createdBy: req.user._id,
      tenant: req.user.tenant, // 
    });

    // increment note count
    tenant.noteCount += 1;
    await tenant.save();

    res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating note", error: error.message });
  }
};

// ✅ Get All Notes (for logged-in user, tenant-based)
 const getNotes = async (req, res) => {
  try {
    let notes;
    if(req.user.role=="member"){
         notes= await Note.find({
      createdBy: req.user._id 
    }).sort({ createdAt: -1 });
    }else{
         notes = await Note.find({ tenant: req.user.tenant })
  .populate("createdBy", "name email") // fetch only name & email from User
  .sort({ createdAt: -1 })
    }

    

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error: error.message });
  }
};


// ✅ Get Single Note
 const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id,
      tenantId: req.user.tenantId,
      createdBy: req.user._id 
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error fetching note", error: error.message });
  }
};

// ✅ Update Note
 const updateNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id, tenantId: req.user.tenantId },
      { title, content, tags },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found or not authorized" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error: error.message });
  }
};

// ✅ Delete Note
 const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found or not authorized" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error: error.message });
  }
};







export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    me,
    createNote,
    getNotes,
    deleteNote,
    updateNote
}