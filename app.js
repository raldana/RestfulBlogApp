const express = require("express");
const expressSanitizer = require("express-sanitizer");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// connect to db
mongoose.connect("mongodb+srv://rest-api-db:Mongmma4819!@cluster0-ttdya.mongodb.net/restful_blog_app?retryWrites=true&w=majority", 
	{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// db schema
const blogSchema = new mongoose.Schema({
	created: Date,
	title: String,
	image: String,
	body: String
});

const Blog = mongoose.model("Blog", blogSchema);

// index route
app.get("/", (req, res) => {
	Blog.find({})
	.then((blogs) => {
		console.log(blogs);
		blogs.forEach((blog) => {
			if (blog.created == null) {
				blog.created = new Date("2020-01-01");
			}
		})
		res.render("index", {blogs: blogs});
	})
	.catch((err) => {
		console.log(err);
	})
})

app.get("/blogs", (req, res) => {
	res.redirect("/");
})

// new route
app.get("/blogs/new", (req, res) => {
	res.render("new");
})

// create route
app.post("/blogs", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	let blog = (req.body.blog);
	Blog.create(blog)
		.then(
			res.redirect("/blogs")
		)
		.catch((err) => {
			console.log(err)
		});
})

// show route
app.get("/blogs/:id", (req, res) => {
	Blog.findById(req.params.id)
		.then((foundBlog) => {
			if (foundBlog.created == null) {
				foundBlog.created = new Date("2020-01-01");
			}
			res.render("show", {blog: foundBlog});
		})
		.catch((err) => {
			console.log(err);
			res.redirect("/blogs/");
		})
})

// edit route
app.get("/blogs/:id/edit", (req, res) => {
	Blog.findById(req.params.id)
		.then((foundBlog) => {
			res.render("edit", {blog: foundBlog});
		})
		.catch((err) => {
			console.log(err);
			res.redirect("/blogs/");
		})
})

// update route
app.put("/blogs/:id", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog)
		.then(() => {
			console.log("id: " + req.params.id + " updated!");
			res.redirect("/blogs/" + req.params.id);
		})
		.catch((err) => {
			console.log(err);
			res.redirect("/blogs/");
		})
});

// delete route
app.delete("/blogs/:id", (req, res) => {
	Blog.findByIdAndDelete(req.params.id)
		.then(() => {
			console.log("id: " + req.params.id + " deleted!");
		})
		.catch((err) => {
			console.log(err);
		})
	res.redirect("/blogs");
});

// start server
app.listen(3000, () => {
	console.log("Server started on port: 3000");
});
