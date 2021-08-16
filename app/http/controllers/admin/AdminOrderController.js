const Order = require("../../../models/order");
const AdminOrderController = () => {
  return {
    index(req, res) {
      Order.find({ status: { $ne: "completed" } }, null, {
        sort: { createdAt: -1 },
      })
        .populate("customerId", "-password")
        .exec((err, orders) => {
          if (req.xhr) {
            res.json(orders);
          } else {
            res.render("admin/orders");
          }
        });
    },
  };
};

module.exports = AdminOrderController;
