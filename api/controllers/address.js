

import Address from "../models/Address.js";

export const addAddress = async (req, res) => {
  try {
    const { fullName, address, city, state, country, pinCode, phoneNumber } =
      req.body;

    const userId = req.user;

    // console.log("BODY:", req.body);
    // console.log("USER:", req.user);

    const userAddress = await Address.create({
      userId,
      fullName,
      address,
      city,
      state,
      country,
      pinCode,
      phoneNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      userAddress,
    });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getAddresses = async (req, res) => {
  let addresses = await Address.find({ userId: req.user }).sort({
    createdAt: -1,
  });
  res.status(200).json({
    message: "Addresses retrieved successfully",
    userAddress: addresses,
  });
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, userId: req.user });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
