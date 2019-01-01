if (localStorage.getItem("address") === null) {
	window.location = "http://localhost:4200/login"
} else {
	window.location = "http://localhost:4200/home"
}