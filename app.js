'use strict';

var express = require('express');

var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');

var path = require('path')
var models = require('./models'),
    Author = models.Author,
    Book = models.Book,
    Chapter = models.Chapter,
    db = models.db;

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(session({
    secret: 'janiscool'
}));

app.use('/files', express.static(path.join(__dirname + '/public/static')));
//why do you need static?


app.get('/api/numVisits', function(req, res, next) {
    if (!req.session.visits) {
        req.session.visits = 1;
        res.send({
            number: 0
        })
    } else {
        req.session.visits++
            res.send({
                number: req.session.visits - 1
            })
    }
})

app.use('/api/books/:id', function(req, res, next) {
    if (isNaN(req.params.id)) {
        // console.log('not a number')
        res.status(500).send('Invalid ID')
    } else {
        next()
    }
})

// app.get('/files/index.html', function(req, res) {
//     // console.log('i went here');
//     // res.send(200);
//     res.sendFile(path.join(__dirname + '/public/static/index.html'));
// })

app.get('/api/books', function(req, res, next) {
    if (!req.query.title) {
        next();
    } else {
        var parsedTitle = req.query.title.replace('%20', ' ');
        Book.findAll({
                where: {
                    title: parsedTitle
                }
            })
            .then(function(books) {
                res.send(books)
            })
            .catch(next)
    }
})

app.get('/api/books', function(req, res, next) {
    if (!req.query.title) {
        Book.findAll()
            .then(function(books) {
                res.send(books)
            })
            .catch(next)
    }
})

app.post('/api/books', function(req, res, next) {
    Book.create({
            title: req.body.title,
            authorId: req.body.authorId
        })
        .then(function(book) {
            res.status(201).send(book)
        })
        .catch(next)
})

app.get('/api/books/:id', function(req, res, next) {

    Book.findOne({
            where: {
                id: req.params.id
            }
        })
        .then(function(book) {
            if (!book) {
                res.status(404)
                throw new Error('beep beep')
            }
            res.send(book)
        })
        .catch(next)
})

app.put('/api/books/:id', function(req, res, next) {
    Book.findOne({
            where: {
                id: req.params.id
            }
        })
        .then(function(book) {
            if (!book) {
                res.send(404)
                throw new Error('beep beep')
            }
            return book.update({
                title: req.body.title
            })
        })
        .then(function(book) {
            res.send(book)
        })
        .catch(next)

})

app.delete('/api/books/:id', function(req, res, next) {
    Book.find({
            where: {
                id: req.params.id
            }
        })
        .then(function(book) {
            if (!book) {
                res.send(404)
                throw new Error('beep beep')
            }
            return book.destroy()
        })
        .then(function() {
            res.sendStatus(204)
        })
        .catch(next)
})

app.get('/api/books/:id/chapters', function(req, res, next) {
    Chapter.findAll({
            where: {
                id: req.params.id
            }
        })
        .then(function(chapters) {
            res.send(chapters)
        })
        .catch(next)
})

app.post('/api/books/:id/chapters', function(req, res, next) {
    Book.findOne({
            where: {
                id: req.params.id
            }
        })
        .then(function(book) {
            Chapter.create({
                    title: req.body.title,
                    text: req.body.text,
                    number: req.body.number,
                    bookId: book.id
                })
                .then(function(chapter) {
                    book.addChapter(chapter)
                        //addChapter not adding the bookId?
                        // chapter.bookId = book.id
                    res.status(201).send(chapter)
                })
        })
        .catch(next)
})

app.get('/api/books/:id/chapters/:chapid', function(req, res, next) {
    Chapter.findOne({
            where: {
                bookId: req.params.id,
                id: req.params.chapid
            }
        })
        .then(function(chapter) {
            if (!chapter) {
                res.sendStatus(404);
                throw new Error('beep beep')
            }
            res.send(chapter)
        })
        .catch(next)
})

app.put('/api/books/:id/chapters/:chapid', function(req, res, next) {
    Chapter.findOne({
            where: {
                bookId: req.params.id,
                id: req.params.chapid
            }
        })
        .then(function(chapter) {
            if (!chapter) {
                res.sendStatus(404);
                throw new Error('beep beep')
            }
            return chapter.update({
                title: req.body.title
            })
        })
        .then(function(chapter) {
            res.send(chapter)
        })
        .catch(next)
})

app.delete('/api/books/:id/chapters/:chapid', function(req, res, next) {
    Book.findOne({
            where: {
                id: req.params.id
            }
        })
        .then(function(book) {

            Chapter.findOne({
                    where: {
                        bookId: req.params.id,
                        id: req.params.chapid
                    }
                })
                .then(function(chapter) {
                    if (!chapter) {
                        res.sendStatus(404);
                        throw new Error('beep beep')
                    }
                    book.removeChapter(chapter);
                    return chapter.destroy();
                })
                .then(function() {
                    res.sendStatus(204)
                })
                .catch(next)
        })
})



app.get('/broken', function(req, res) {
    res.send(500);
})

app.get('/forbidden', function(req, res) {
    res.send(403);
})



















module.exports = app;
