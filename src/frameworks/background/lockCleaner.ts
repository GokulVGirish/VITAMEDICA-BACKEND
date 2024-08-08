import doctorSlotsModel from "../mongoose/models/DoctorSlotsSchema";


async function releaseExpiredLocks(){
    const now = new Date();
    await doctorSlotsModel.updateMany(
      {
        "slots.locked": true,
        "slots.lockExpiration": { $lt: now },
      },
      {
        $set: {
          "slots.$[].locked": false,
          "slots.$[].lockedBy": null,
          "slots.$[].lockExpiration": null,
        },
      }
    );
     console.log("Expired locks released.");

}
export function startLockCleaner(){
    setInterval(releaseExpiredLocks, 60 * 1000);

}