module.exports = {
  async up(db, client) {
    // Add the 'imgUrl' field to the 'products' collection
    await db.collection('products').updateMany({}, { $set: { imgUrl: '' } });
  },

  async down(db, client) {
    // Remove the 'imgUrl' field from the 'products' collection
    await db.collection('products').updateMany({}, { $unset: { imgUrl: '' } });
  },
};
