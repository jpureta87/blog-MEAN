const Post = require("../models/post");


exports.createPost = (req, res, next) => {
  //Construct url for the image path
  const url = `${req.protocol}://${req.get("host")}`;
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    //En middleware auth-check agregamos en su request este campo userData y aca lo podemos acceder porq ese middleware se uso anteriormente en esta etapa.
    creator: req.userData.userId,
  });
  post
    .save()
    .then((createdPost) => {
      const createdObjectPost = createdPost.toObject();
      res.status(201).json({
        message: "Post added successfully!",
        post: {
          //Ojo con el spread operator ya que mongoose crea un objeto con elementos adicionales. En este caso nos sirve
          //VER: https://www.udemy.com/angular-2-and-nodejs-the-practical-guide/learn/v4/questions/4851476
          //En vez de usar el spread operator usamos el metodo toObject();
          createdObjectPost,
          id: createdPost._id,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Creating a post failed!",
      });
    });
};

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully!!",
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Fetching posts failed!",
      });
    });
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({
          message: "Post deleted successfully",
          deletedPostId: req.params.id,
        });
      } else {
        res.status(401).json({
          message: "Not Authorized!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Deleting the post failed!",
      });
    });
};

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = `${req.protocol}://${req.get("host")}`;
    imagePath = url + "/images/" + req.file.filename;
  }

  const editedPost = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId,
  });
  Post.updateOne(
    { _id: req.params.id, creator: req.userData.userId },
    editedPost
  )
    .then((post) => {
      console.log(post);
      if (post.matchedCount > 0) {
        res.status(200).json({
          message: "Edit was successfull!",
          editedPostId: req.params.id,
        });
      } else {
        res.status(401).json({
          message: "Not Authorized!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Updating the post failed!",
      });
    });
};

exports.getPostById = (req, res, next) => {
  Post.findById(req.params.id)
    .then((result) => {
      if (result) {
        res.status(200).json({
          message: "Get successfull",
          post: result,
        });
      } else {
        res.status(404).json({
          message: "Post not found!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Fetching post failed!",
      });
    });
};
