const Materials = require("../models/Material");
const { Op } = require("sequelize");

//HELPERS FOR PAGINATION AND SEARCH BY TITLE
const getPagination = (page, size) => {
  const limit = size ? +size : 4;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: videos } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, videos, totalPages, currentPage };
};

//GET /api/materials
//    /api/materials //return default size 4 videos
//    /api/materials?title=some-video-title //return video by title
//    /api/materials?page=page-number //return specific page

exports.getAllMaterials = async (req, res) => {
  const {  page, size, title } = req.query;
  const condition = title ? { title: { [Op.iLike]: `%${title}` } } : null;
  const { limit, offset } = getPagination(page, size);
  try {
    const data = await Materials.findAndCountAll({ 
        where: condition, 
        limit, 
        offset
      });
    const response = getPagingData(data, page, limit)
    if(response) {
      res.json(response);
    } else {
      res
        .status(404)
        .json({message: "No videos were found"});
    }
  } catch (error) {
    console.error("Error retrieving videos: ", error);
    res.status(500).json({ error: "Internal server error" })
  }
}      

//GET /api/materials/:id
exports.getMaterialsById = async (req, res) => {
  try {
    const video = await Materials.findByPk(req.params.id);

    if (video) {
      res.json(video);
    } else {
      res
        .status(404)
        .json({ message: `Resource with id=${req.params.id} not found` });
    }
  } catch (error) {
    console.error("Error retrieving video: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

//POST /api/materials
exports.createMaterials = async (req, res) => {
  try {
    const { publisher, title, description, videoURL, image, duration } = req.body;

    const newVideo = await Materials.create({
      publisher,
      title,
      description,
      videoURL,
      image,
      duration
    });

    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Error creating a new video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//PUT /api/materials/:id
exports.updateMaterials = async (req, res) => {
  try {
    const { publisher, title, description, videoURL, image, duration} = req.body;

    const numAffectedRows = await Materials.update(
      {
        publisher,
        title,
        description,
        videoURL,
        image,
        duration
      },
      {
        where: { id: req.params.id }
      }
    );

    if (numAffectedRows[0] > 0) {
      const updatedVideo = await  Materials.findByPk(req.params.id);
      res.json(updatedVideo);
    } else {
      res
        .status(404)
        .json({ message: `Video with id: ${req.params.id} not found` });
    }
  } catch (error) {
    console.error("Error retrieving video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

//DELETE /api/materials/:id
exports.deleteMaterials = async (req, res) => {
  try {
    const numDeleted = await Materials.destroy({
      where: { id: req.params.id },
    });
    
    if (numDeleted) {
      res.status(204).json({ message: "Video deleted successfully" });
    } else {
      res
        .status(404)
        .json({ message: `Video with id=${req.params.id} not found` });
    } 
  } catch (error) {
    console.error("Error deleting Video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}