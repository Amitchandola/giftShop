import express from "express";
import { addAddress, getAddresses, deleteAddress } from "../controllers/address.js";
import { Authenticated } from "../middlewares/auth.js";

const router = express.Router();
//add adress
router.post("/add", Authenticated, addAddress);

//get address
router.get("/get", Authenticated, getAddresses);

//delete address
router.delete("/delete/:id", Authenticated, deleteAddress);

export default router;
