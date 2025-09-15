import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import { Tenant } from "../models/tenant.model.js";

const createUserAccount = asyncHandler(async (req,res)=>{
    const { firstName, lastName, email, password, role, birthDate, sendEmail } = req.body
    console.log(req.body);
    
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists in your organization'
      });
    }



    const user = await User.create({
        name:firstName+lastName,
        isAdmin:false,
        email, 
        password,
        role:"member",
        tenant:req.user.tenant
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})



const getAllUsers = async (req, res) => {
  try {
    
    const users = await User.find({ tenant: req.user.tenant })
      .select("-password -refreshToken");

    console.log("yes");

    return res.status(200).json(users);
  } catch (error) {
    
    return res.status(500).json({ message: error.message });
  }
};


// READ - Get single user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});


// UPDATE User
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedUser = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "User updated successfully")
  );
});


// DELETE User
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "User deleted successfully")
  );
});



const upgradePlan = async (req, res) => {
  try {
    const { slug } = req.params;

    // find tenant by slug
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // check current plan
    if (tenant.plan === "pro") {
      return res.status(400).json({ message: "Tenant is already on Pro plan" });
    }

    // upgrade plan
    tenant.plan = "pro";
    tenant.noteLimit = 1000; // example limit for Pro plan
    await tenant.save();

    res.status(200).json({
      message: "Plan upgraded successfully",
      tenant,
    });
  } catch (error) {
    console.error("Upgrade plan error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



export {
    createUserAccount,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    upgradePlan
}