/*jshint esnext: true */
let siteRoot = "https://localhost:8080";
let gUser = {};

$(function () {
    "use strict";

    gapi.load('auth2', function () {
        let auth2 = gapi.auth2.init({
            client_id: '55110569297-i3pcih5ml0kras7nlc6pdvb6hfvfje1v.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/calendar.readonly',
            hosted_domain: 'catalystdevworks.com'
        });
    });
    gapi.load('signin2', function () {
        //console.log('signin2 loaded')
        gapi.signin2.render('gsignin', {
            'scope': 'email',
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
        //console.log("Code: " + googleUser.code);

        //    auth2.grantOfflineAccess({
        //            'redirect_uri': 'postmessage'
        //        }).then(signInCallback);

        // The ID token you need to pass to your backend:
        let id_token = googleUser.getAuthResponse().id_token;
        console.log("ID Token: " + id_token);

        let xhr = new XMLHttpRequest();
        xhr.open('POST', siteRoot + '/tokensignin');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            $('#content').text(xhr.responseText);
            gUser = googleUser;
        };
        xhr.send(JSON.stringify(googleUser.getAuthResponse()));
    };


    $('#signToken').click(() => {
        $.post(`${siteRoot}/signtoken`, gUser.getAuthResponse().id_token, (data, textStatus, jqXHR) => {
            $('#signedToken').text(data);
            $.ajax({
                url:'https://yv8ce9onia.execute-api.us-east-1.amazonaws.com/dev/identity',
                method: 'GET',
                headers: {
                    Authorization: data
                }
            });
        });
    });

    $('#verify').click(() => {
        $.post(`${siteRoot}/verifytoken`, $('#signedToken').text(), (data, textStatus, jqXHR) => {
            console.log(`got some verified jwt: ${data} `);
            $('#verifiedToken').text(data);
        });
    });

    $('#queryMicroservice').click(() => {
        queryMicroService(gUser.getAuthResponse().id_token);
    });
    
    $('#queryFederation').click(() => {
        queryMicroService(gUser.getAuthResponse().id_token, '/federate');
        console.log(gUser.getAuthResponse().id_token);
    });
    
    $('#queryMicroserviceInvalid').click(() => {
        queryMicroService('meow');
    });
    
    $('#querySolr').click(()=>{
        $('#microserviceResponse').html('');
        $.ajax({
            type: 'GET',
            url: `${siteRoot}/solr`,
            headers: {
                Authorization: 'Bearer ' + gUser.getAuthResponse().id_token
            }
        }).done((data, textStatus, jqXHR) => {
            $('#microStatus').append(`Recieved ${textStatus}`);
            console.log(`queried a microservice and got ${data}`);
            $('#microserviceResponse').html(data);
        });
    });
    
    $('#queryTimeline').click(()=>{
        $('#microserviceResponse').html('');
        $.ajax({
            type: 'GET',
            url: `${siteRoot}/timeline`,
            headers: {
                Authorization: 'Bearer ' + gUser.getAuthResponse().id_token
            }
        }).done((data, textStatus, jqXHR) => {
            $('#microStatus').append(`Recieved ${textStatus}`);
            console.log(`queried a microservice and got ${data}`);
            $('#microserviceResponse').html(data);
        });
    });
    $('#authQueryReplicon').click(()=>{
        queryReplicon([{ "Action":"Query", "QueryType":"UserByEmail", "DomainType":"Replicon.Domain.User", "Args":["trau@catalystitservices.com" ] }]); 
    });
    
    $('#unauthQueryReplicon').click(()=>{
        queryReplicon([{ "Action":"Edit", "QueryType":"UserByEmail", "DomainType":"Replicon.Domain.User", "Args":["trau@catalystitservices.com" ] }]); 
    });
    
    function queryReplicon(data) {
        $('#microserviceResponse').html('');
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            url: `${siteRoot}/replicon`,
            headers: {  
                Authorization: 'Bearer ' + gUser.getAuthResponse().id_token                
            }
        }).done((data, textStatus, jqXHR) => {
            $('#microserviceResponse').html(data);
        });
    };
    function queryMicroService(token, endpoint) {
        if (endpoint == null){endpoint = '/microservice'}
        $('#microserviceResponse').html('');
        $.ajax({
            type: 'POST',
            url: `${siteRoot}${endpoint}`,
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).done((data, textStatus, jqXHR) => {
            $('#microStatus').append(`Recieved ${textStatus}`);
            console.log(`queried a microservice and got ${data}`);
            $('#microserviceResponse').html(data);
        });
    }
    

});