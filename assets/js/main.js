var Gimmie = {
    $content: $('.content'),
    $form: $('form'),
    userInput: '',
    userInputIsValid: false,
    appId: '',

    validate: function(input) {
        // Use regex to test if input is valid. It's valid if:
        // 1. It begins with 'http://itunes'
        // 2. It has '/id' followed by digits in the string somewhere
        var regUrl = /^(http|https):\/\/itunes/;
        var regId = /\/id(\d+)/i;
        if ( regUrl.test(this.userInput) && regId.test(this.userInput) ) {
            this.userInputIsValid = true;
            var id = regId.exec(this.userInput);
            this.appId = id[1];
        } else {
            this.userInputIsValid = false;
            this.appId = '';
        }
    },
    toggleLoading: function(){
        // Toggle loading indicator
        this.$content.toggleClass('content--loading');
         
        // Toggle the submit button so we don't get double submissions
        // http://stackoverflow.com/questions/4702000/toggle-input-disabled-attribute-using-jquery
        this.$form.find('button').prop('disabled', function(i, v) { 
        	return !v; });
   
    },
    throwError: function(header, text){
        this.$content
            .html('<p><strong>' + header + '</strong> ' + text + '</p>')
            .addClass('content--error');
 
        this.toggleLoading();
    },
    render: function(response){
        var icon = new Image();
        icon.src = response.artworkUrl512;
        icon.onload = function() {
            Gimmie.$content
                .html(this)
                .append('<p><strong>' + response.trackName + '</strong></p>')
                .removeClass('content--error');
            Gimmie.toggleLoading();
        }
    }
};
 
$(document).ready(function(){
    // On page load, execute this...
    Gimmie.$form.on('submit', function(e){
        e.preventDefault();
        Gimmie.toggleLoading(); // call the loading function
    });
});

Gimmie.$form.on('submit', function(e){
    /* our previous code here */
    Gimmie.userInput = $(this).find('input').val();
    Gimmie.validate();
    if( Gimmie.userInputIsValid ) {
        $.ajax({
        url: "https://itunes.apple.com/lookup?id=" + Gimmie.appId,
        dataType: 'JSONP'
        })
        .done(function(response) {
        // Get the first response and log it
            var response = response.results[0];
            console.log(response);
            // Check to see if request is valid & contains the info we want
            // If it does, render it. Otherwise throw an error
            if(response && response.artworkUrl512 != null){
                Gimmie.render(response);
            } else {
                Gimmie.throwError(
                'Invalid Response',
                'The request you made appears to not have an associated icon. <br> Try a different URL.'
                );
            }
        })
        .fail(function(data) {
            Gimmie.throwError(
                'iTunes API Error',
                'There was an error retrieving the info. Check the iTunes URL or try again later.'
            );
        });
    } else {
       Gimmie.throwError(
        'Invalid Link',
        'You must submit a standard iTunes store link with an ID, i.e. <br> <a href="https://itunes.apple.com/us/app/twitter/id333903271?mt=8">https://itunes.apple.com/us/app/twitter/<em>id333903271</em>?mt=8</a>'
        );
    }
});