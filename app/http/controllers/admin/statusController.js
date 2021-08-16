const Order = require("../../../models/order");
const statusController = () => {
  return {
    update(req, res) {
      Order.updateOne(
        { _id: req.body.orderId },
        { status: req.body.status },
        (err, order) => {
          if (err) {
            return res.redirect("/admin/orders");
          }
          // emit event to
          const eventEmitter = req.app.get("eventEmitter");
          eventEmitter.emit("orderUpdated", {
            id: req.body.orderId,
            status: req.body.status,
          });
          return res.redirect("/admin/orders");
        }
      );
    },
  };
};

module.exports = statusController;