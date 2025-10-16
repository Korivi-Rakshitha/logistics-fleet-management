# Customer Order Placement Feature - Implementation Guide

## 🎯 Feature Overview

This update implements a customer-driven order placement workflow where:
1. **Customers** can place delivery orders by specifying locations and vehicle type
2. **Admin** reviews pending orders and accepts/rejects them
3. **Admin** assigns drivers and vehicles to accepted orders
4. **Create Delivery** option has been removed from admin dashboard

---

## 🔄 Changes Made

### **1. Database Schema Update**
Added `requested_vehicle_type` column to deliveries table.

**To apply the database update:**
```bash
cd backend
node utils/updateDb-add-vehicle-type.js
```

### **2. Customer Dashboard Changes**
- ✅ Added "Place New Order" button
- ✅ Order placement form with:
  - From location (pickup address + coordinates)
  - To location (drop address + coordinates)
  - Vehicle type selection (Truck/Van/Bike/Car)
  - Package details
  - Priority level
  - Scheduled pickup/delivery times
- ✅ Orders are created with `status: 'pending'`

### **3. Admin Dashboard Changes**
- ✅ Removed "Create Delivery" button
- ✅ Removed create delivery modal
- ✅ Added "Pending Customer Orders" section at top of deliveries tab
- ✅ Each pending order shows:
  - Customer name
  - From/To locations
  - Requested vehicle type
  - Priority level
- ✅ Two action buttons per order:
  - **Accept & Assign**: Opens driver/vehicle assignment modal
  - **Reject Order**: Cancels the order

### **4. Backend Changes**
- ✅ Updated `Delivery` model to handle `requested_vehicle_type` field
- ✅ API supports customer order creation with vehicle type preference

---

## 🚀 How to Use

### **As a Customer:**

1. **Login** to customer dashboard
2. Click **"Place New Order"** button
3. Fill in the order form:
   - Enter pickup location and coordinates
   - Enter drop location and coordinates
   - Select desired vehicle type
   - Add package details
   - Set priority (low/medium/high)
   - Optional: Set pickup and delivery times
4. Click **"Place Order"**
5. Order is submitted with status `pending`
6. Wait for admin to review and assign a driver

### **As an Admin:**

1. **Login** to admin dashboard
2. Go to **"Deliveries"** tab
3. See **"Pending Customer Orders"** section at the top
4. For each pending order:
   - Review customer details and requirements
   - Check requested vehicle type
   - **Option 1: Accept**
     - Click "Accept & Assign"
     - Select a driver
     - Select a vehicle (preferably matching requested type)
     - Click "Assign"
     - Order status changes to `assigned`
   - **Option 2: Reject**
     - Click "Reject Order"
     - Confirm rejection
     - Order status changes to `cancelled`

---

## 📋 Workflow Diagram

```
Customer                     Admin                      Driver
   |                           |                          |
   | 1. Place Order            |                          |
   |-------------------------->|                          |
   |   (status: pending)       |                          |
   |                           |                          |
   |                           | 2. Review Order          |
   |                           |                          |
   |                           | 3a. Accept & Assign      |
   |                           |    (select driver/vehicle)|
   |                           |------------------------->|
   |                           |   (status: assigned)     |
   |                           |                          |
   |                    OR     |                          |
   |                           |                          |
   |                           | 3b. Reject Order         |
   |                           |   (status: cancelled)    |
   |                           |                          |
```

---

## 🗄️ Database Schema

### **Deliveries Table** (Updated)
```sql
CREATE TABLE deliveries (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  driver_id INTEGER,
  vehicle_id INTEGER,
  pickup_location TEXT NOT NULL,
  pickup_lat REAL NOT NULL,
  pickup_lng REAL NOT NULL,
  drop_location TEXT NOT NULL,
  drop_lat REAL NOT NULL,
  drop_lng REAL NOT NULL,
  requested_vehicle_type TEXT,  -- NEW FIELD
  package_details TEXT,
  priority TEXT,
  status TEXT,
  scheduled_pickup_time DATETIME,
  scheduled_delivery_time DATETIME,
  ...
);
```

---

## 🎨 UI Changes

### **Customer Dashboard**
- New button: "Place New Order" (pink/purple gradient)
- Collapsible order form with modern styling
- Form validation for required fields
- Success/error notifications

### **Admin Dashboard**
- Highlighted "Pending Orders" section (yellow/orange gradient)
- Card-based layout for each pending order
- Green "Accept & Assign" button
- Red "Reject Order" button
- Removed create delivery functionality

---

## 🔧 Technical Details

### **Files Modified:**

1. **Frontend:**
   - `frontend/src/components/CustomerDashboard.jsx`
     - Added order form state
     - Added handleOrderSubmit function
     - Added order placement UI
   
   - `frontend/src/components/AdminDashboard.jsx`
     - Removed showDeliveryModal state
     - Removed deliveryForm state
     - Removed handleDeliverySubmit function
     - Added handleRejectOrder function
     - Removed create delivery modal
     - Added pending orders section

2. **Backend:**
   - `backend/models/Delivery.js`
     - Updated create method to accept requested_vehicle_type
   
   - `backend/utils/updateDb-add-vehicle-type.js`
     - Database migration script (NEW FILE)

---

## ✅ Testing Checklist

- [ ] Customer can place an order
- [ ] Order appears in admin's pending section
- [ ] Admin can see requested vehicle type
- [ ] Admin can accept and assign driver/vehicle
- [ ] Admin can reject an order
- [ ] Rejected orders show as cancelled
- [ ] Accepted orders show as assigned
- [ ] Create delivery button is removed from admin
- [ ] Create delivery modal is removed

---

## 🐛 Troubleshooting

### **Issue: "requested_vehicle_type" column doesn't exist**
**Solution:** Run the database update script:
```bash
cd backend
node utils/updateDb-add-vehicle-type.js
```

### **Issue: Orders not showing in pending section**
**Solution:** Check that orders have `status: 'pending'`

### **Issue: Cannot place order**
**Solution:** 
- Check browser console for errors
- Verify backend is running
- Check network tab for API errors

---

## 📝 Notes

- Orders placed by customers automatically have `status: 'pending'`
- Only admin can change status from pending to assigned/cancelled
- Requested vehicle type is a preference, admin can assign any available vehicle
- All existing functionality (driver tracking, customer tracking) remains unchanged

---

## 🎉 Benefits

1. **Customer Empowerment**: Customers can self-serve and place orders
2. **Admin Control**: Admin reviews and approves all orders
3. **Better Planning**: Admin can see vehicle type preferences
4. **Streamlined Workflow**: Clear separation of customer requests and admin assignments
5. **Reduced Admin Work**: No need to manually create orders for customers

---

**Implementation Complete! ✅**
