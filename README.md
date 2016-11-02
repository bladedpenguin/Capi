## Catalyst API 

Catalyst API is about deploying Catalyst services to the cloud in a secure way. To do this, we require [Service tokens](https://docs.google.com/a/catalystdevworks.com/document/d/1_ceKEnRGj9tooyIT1pRc_wcDJ4l3LsMRc4GSf3JnCoY/edit?usp=sharing), which themselves contain [Google Identity Tokens](https://developers.google.com/identity/sign-in/web/reference#googleusergetbasicprofile)

* / - GET - planned HATEOAS documentation on other endpoints
    * /profiles - GET - Service/ID Token - search and retrieve profiles of Catalyst Employees. This is backed by [CloudSearch](http://docs.aws.amazon.com/cloudsearch/latest/developerguide/search-api.html) and will accept CloudSearch Queries.
    * /hr - POST - Service Token - allows posting of queries to Replicon.
        * /projects/{id} - Service Token - get the replicon project with this id
    * /tracking - planned JIRA endpoints
    * /bootcamps
        * /uiux - POST - ID Token - a federation endpoint which returns a url that grants access to the S3 bucket fileshare.catalystdevworks.com 


## [Using CAPI Services](https://docs.google.com/document/d/1_ceKEnRGj9tooyIT1pRc_wcDJ4l3LsMRc4GSf3JnCoY)
### Gaining Access to microservices
There are three types of authentication that CAPI endpoints use: 
* Service Token - This is a JSON Web Token, in the `authorization` header of each request. It must be valid for no more than an hour, signed by a known Catalyst service, and have the key id field properly set.
* Identity Token - Get an id_token from [Google Sign In](https://developers.google.com/identity/sign-in/web/reference#googleusergetauthresponse). The Hosted Domain must be "catalystdevworks.com"
* Service/Identity Token - a normal catalyst service token with it's `gtoken` field set to an identity token from the current user.
Requests must have a valid JSON Web Token in the Authorization header. 
* Service tokens must be signed by a trusted service. Catalyst developers can submit certificates to  Brent Stees (bstees@catalystdevworks.com). The JWT should have a consistent issuer (iss) value which will be used to identify the certificate.
* JWTs must have a gtoken field, which must contain a Google Identity Token. That will be validated against Google’s tokeninfo endpoint.  This Google id token must have a Hosted Domain (hd) field that equals “catalystdevworks.com”

>Header: {
>  "alg": "RS256",
>  "typ": "JWT",
>  "kid": "prast" //this must line up with a prast.crt, which is submitted to Brent
>}
>Payload:
>{
>  "gtoken": "eyJh….L6F-Q", //This must be the user currently using the service, as per gapi.auth2.AuthResponse.id_token.  The hd parameter must be “cataylstdevworks.com”
>  "iat": 1463513173,
>  "exp": 1463516773,
>  "aud": "solr", //not actually critical or checked as of now. We probably will check it later
>  "iss": "prast" //this should match the kid field in the header. Later maybe this should match the hostname eg. prast.catalystdevworks.com
>}
We considered a number of [identity providers](https://git.catalystitservices.com/Rau/Capi/wikis/home) before we settled on the current setup.
### Adding a microservice to Catalyst API
#### What we need to get started
1. A Docker image containing the microservice.
2. A list of endpoints for the microservice. RESTful is preferred, but not all applications can easily be made fully RESTful.
3. Some information on non-functional requirements.
4. List of AWS services required
####Non-functional requirements:
* Scalability:  (default: not scalable) We are assuming that microservices do not need to scale as their customers are all Catalyst employees. We can scale with Autoscaling groups in aws, but not all microservices(like SOLR) scale simply and often require additional infrastructure(zookeeper and exhibitor) to scale properly.
* Security: (default: basic CAPI security) We are assuming that microservices are intended to only be used by Catalyst employees accessing Catalyst Services. Catalyst API will check for a valid Google Identity Token signed by a Catalyst service before allowing access. If a microservice has a different intended audience, we can create additional authorization functions.
* Availability: (default: simple) We are assuming that a single amazon EC2 provides enough availability. If there are special availability requirements, we can include redundancy, load balancing, and automated response to failures etc.
* Capacity: (specify storage needs) microservices can use any kind of data storage from RDS to EBS to S3. We need to know what kind of persistence a microservice needs.




