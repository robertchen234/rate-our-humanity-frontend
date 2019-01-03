document.addEventListener("DOMContentLoaded", () => {
  getReviews()
  prepareSubmitReview()
  slider()
})

function getReviews() {
  const reviewSection = document.querySelector("#review-section")
  reviewSection.innerHTML = ""
  let ratings = []

  fetch("http://localhost:3000/api/v1/reviews")
  .then(data => data.json())
  .then(reviews => reviews.forEach(review => {
    renderReview(review)
    getAverageRating(review, ratings)
  }))
}

function renderReview(review) {
  const reviewSection = document.querySelector("#review-section")
  const reviewDiv = document.createElement("DIV")
  reviewDiv.className = "well"
  reviewDiv.dataset.id = review.id
  reviewSection.prepend(reviewDiv)

  const rating = review.rating
  const content = review.content
  const username = review.user.username
  reviewDiv.innerHTML = `
  <h3>Rating: <span class="rating">${rating}</span> ❤️</h3>
  <p class="content">${content}</p>
  <p class="username"><i>${username}</i></p>
  `
}

function getAverageRating(review, ratings) {

  ratings.push(review.rating)

  let total = 0
  for(let i = 0; i < ratings.length; i++) {
    total += ratings[i]
  }
  let avg = total / ratings.length

  const averageRating = document.querySelector("#average-rating")
  averageRating.innerText = avg.toFixed(1)
}


function prepareSubmitReview() {
  const deleteButton = document.querySelector("#delete")
  deleteButton.style.display = "none"
  const reviewForm = document.querySelector("#review-form")
  reviewForm.addEventListener("submit", e => {
    const rating = reviewForm.querySelector("#input-rating")
    const content = reviewForm.querySelector("#input-content")
    const username = reviewForm.querySelector("#input-username")

    submitReview(e, rating, content, username)
  })
}

function submitReview(e, rating, content, username) {
  e.preventDefault()
  const deleteButton = document.querySelector("#delete")
  deleteButton.style.display = "inline-block"
  let usernames = []

  fetch("http://localhost:3000/api/v1/users")
  .then(data => data.json())
  .then(users => users.forEach(user => {
    if(user.username === username.value) {
      usernames.push(user.username)
      patchReview(user, rating, content)
    }
  }))
  .then(users => {
    if (!usernames.includes(username.value)){
      postUser(username, rating, content)
    }
  })
}

function patchReview(user, rating, content) {
  const reviewId = user.reviews[0].id
  const topSection = document.querySelector("#top-section")
  topSection.dataset.id = reviewId

  fetch(`http://localhost:3000/api/v1/reviews/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      rating: rating.value,
      content: content.value
    })
  }).then(console.log("patched to reviews database"))
  .then(data => data.json())
  .then(review => {
    removeReviewFromDom(review)
    getReviews()
  })
}

function removeReviewFromDom(review) {
  let allReviewDivs = document.querySelectorAll(".review")

  allReviewDivs.forEach(div => {
    if (parseInt(div.dataset.id) === review.id) {
      div.remove()
    }
  })
}

function postUser(username, rating, content) {
  fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      username: username.value
    })
  }).then(console.log("posted to users database"))
  .then(data => data.json())
  .then(user => postReview(user, rating, content))
}

function postReview(user, rating, content) {
  fetch("http://localhost:3000/api/v1/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      rating: rating.value,
      content: content.value,
      user_id: user.id
    })
  }).then(console.log("posted to reviews database"))
  .then(data => data.json())
  .then(review => {
    const topSection = document.querySelector("#top-section")
    topSection.dataset.id = review.id
    getReviews()
  })
}

function deleteReview() {
  const topSection = document.querySelector("#top-section")
  const reviewId = parseInt(topSection.dataset.id)

  fetch(`http://localhost:3000/api/v1/reviews/${reviewId}`, {
    method: "DELETE"
  }).then(console.log("deleted from reviews database"))
  .then(getReviews)
}

slider = () => {
  var slider = document.getElementById("input-rating");
  var output = document.getElementById("demo");
  output.innerHTML = slider.value;

  slider.oninput = function() {
    output.innerHTML = this.value;
  }
}
