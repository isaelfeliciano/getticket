const low = require('lowdb');
const _ = require('lodash');
// const dbFile = process.env.GETTICKET_DB;
const shortid = require('shortid');
const dbFile = '\\\\dr_nas\\dr_it\\DB_JSON\\db.json';


if (!process.env.NW_ENV) {
	$('a[href="#second-page"]').remove();
}


$('.btn-get-ticket').on("click", function (e) {
	e.preventDefault();
	let name = $('#name').val();
	let deviceType = $('#device-type').val();
	let userCompany = $('#user-company').val();
	let plant = $('.usr-plant__option--selected').text();

	if (name === '') {
		return nameIsEmpty();
	}

	if (!/^[a-zA-Z]*$/g.test(name)) {
		return flashMessage("Letters only, please");
	}

	if (name.length < 6) {
		return flashMessage("This don't look like a valid name");
	}

	submitForm({
		"_id": shortid.generate(),
		"name": name,
		"deviceType": deviceType,
		"userCompany": userCompany,
		"plant": plant
	}, function(ticket) {
		$('#name').val('');
		alert(`Ticket ID: ${ticket}`);
	});
});

var submitForm = function(data, callback) {
	const db = low(dbFile);

	let now = new Date();
	let startDate = now.toJSON();
	let plusSevenDays = now.setHours(now.getHours() + 168);
	let endDate = new Date(plusSevenDays).toJSON();
	let ticketsActive = db.get('tickets.active').value();

	if (ticketsActive.length < 1) {
		flashMessage("There is no tickets to give, Contact IT Department");
		return;
	}

	let ticket = db.get('tickets.active')
		.take(1)
		.value();

	data.ticket_id = ticket[0];
	data.start = startDate;
	data.end = endDate;

	db.get('users')
		.push(data)
		.value();

	updateTicketList(data);

	db.get('tickets.used')
		.push(ticket[0])
		.value();

	db.get('tickets.active')
		.pull(ticket[0])
		.value();

	callback(ticket[0]);
}


$('.usr-plant__option').on('click', function () {
	let currentElement = this;
	if ($(this).hasClass('usr-plant__option--selected')) {
		console.log("Is already selected");
	} else {
		$('.usr-plant__option--selected').removeClass('usr-plant__option--selected');
		$(currentElement).addClass('usr-plant__option--selected');
	}
});

var nameIsEmpty = function() {
	$('input#name').addClass('js-name-empty');
	$('body').focus();
}

$('input#name').on('focus', function() {
	$(this).removeClass('js-name-empty');
});

$('a[href="#first-page"]').on('click', function() {
	$('img').removeClass('img-logo--second-page').addClass('img-logo');
});

$('a[href="#second-page"]').on('click', function() {
	$('img').removeClass('img-logo').addClass('img-logo--second-page');
})
.one('click', function(event) {
	populateTicketList();
});

function populateTicketList() {
	const db = low(dbFile);

	let userList = db.get('users').value();
	for (user in userList) {
		updateTicketList(userList[user]);
	}
}

function updateTicketList(doc) {
	doc.start = new Date(doc.start);
	doc.end = new Date (doc.end);
	$('.tickets-list').append(`
		<div class="tickets-list__box">
      <span class="js-ticket-name">${doc.name}</span>
      <span class="js-ticket-name">${doc.userCompany}</span>
      <span class="js-ticket-device-type">${doc.deviceType}</span>
      <span class="js-ticket-plant">${doc.plant}</span>
      <span class="js-ticket-id">${doc.ticket_id}</span>
      <span class="js-ticket-start-date">From: ${doc.start}</span>
      <span class="js-ticket-end-date">To: ${doc.end}</span>
    </div>
	`);
}

// Flash Message
function flashMessage(msg){
	if(hideFlashMessage)
		clearTimeout(hideFlashMessage);
	$('.flashmessage').removeClass('not-visible')
	.html('<p>'+msg+'</p>');
	var hideFlashMessage = setTimeout(function(){
		$('.flashmessage').addClass('not-visible').
		html('');
	}, 3000);
}
// Flash Message