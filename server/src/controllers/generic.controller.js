import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAuditLog } from "../middleware/audit.js";

export function crudController(Model, resourceType) {
  return {
    list: asyncHandler(async (_req, res) => {
      let query = Model.find();
      if (Model.schema.paths.userId) query = query.populate("userId", "-passwordHash");
      if (Model.schema.paths.department) query = query.populate("department");
      if (Model.schema.paths.headDoctorId) query = query.populate("headDoctorId");
      const data = await query.sort({ createdAt: -1 });
      res.json({ success: true, message: `${resourceType} list loaded`, data });
    }),
    get: asyncHandler(async (req, res) => {
      let query = Model.findById(req.params.id);
      if (Model.schema.paths.userId) query = query.populate("userId", "-passwordHash");
      if (Model.schema.paths.department) query = query.populate("department");
      if (Model.schema.paths.headDoctorId) query = query.populate("headDoctorId");
      const data = await query;
      if (!data) throw new AppError(`${resourceType} not found`, 404);
      res.json({ success: true, message: `${resourceType} loaded`, data });
    }),
    create: asyncHandler(async (req, res) => {
      const data = await Model.create(req.body);
      await writeAuditLog({
        req,
        action: `${resourceType.toLowerCase()}.create`,
        resourceType,
        resourceId: data._id,
        after: data.toObject()
      });
      res.status(201).json({ success: true, message: `${resourceType} created`, data });
    }),
    update: asyncHandler(async (req, res) => {
      const before = await Model.findById(req.params.id);
      if (!before) throw new AppError(`${resourceType} not found`, 404);
      const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      await writeAuditLog({
        req,
        action: `${resourceType.toLowerCase()}.update`,
        resourceType,
        resourceId: data._id,
        before: before.toObject(),
        after: data.toObject()
      });
      res.json({ success: true, message: `${resourceType} updated`, data });
    })
  };
}
