/*jshint esnext: true */
let siteRoot = "https://api.catalystdevworks.com";
let gUser = {};

(function () {
    "use strict";

    gapi.load('auth2', function () {
        let auth2 = gapi.auth2.init({
            client_id: '1027977712243-q8pbbq23nibu9vlqd9p9loietg8t3cuf.apps.googleusercontent.com',
//            scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
            hosted_domain: 'catalystdevworks.com'
        });
    });
    gapi.load('signin2', function () {
        //console.log('signin2 loaded')
        gapi.signin2.render('gsignin', {
//            'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
            'width': 250,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSignIn,
            //            'onfailure': onSignInFailure
        });
    });

    function onSignIn(googleUser) {
        // Useful data for your client-side scripts:
        let profile = googleUser.getBasicProfile();
        console.log("ID: " + profile.getId()); // Don't send this directly to your server!
        console.log(`Full Name:   ${profile.getName()}`);
        console.log('Given Name: ' + profile.getGivenName());
        console.log('Family Name: ' + profile.getFamilyName());
        console.log("Image URL: " + profile.getImageUrl());
        console.log("Email: " + profile.getEmail());
        
        // The ID token you need to pass to your backend:
        let id_token = googleUser.getAuthResponse().id_token;
        console.log("ID Token: " + id_token);

        let xhr = new XMLHttpRequest();
        xhr.open('POST', siteRoot + '/bootcamps/uiux');
        xhr.setRequestHeader('Authorization', id_token)
        xhr.onload = function () {
            var signin = xhr.responseText.replace(/"/g,"");
            console.log("Signinurl:" + signin);
            gapi.auth2.getAuthInstance().signOut().then(function(){
                console.log("Signed out of google");
                window.location.href = signin; 
            });
        };
        xhr.send();
    };
    

})();