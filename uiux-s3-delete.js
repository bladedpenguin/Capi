var aws = require('aws-sdk'),
    s3 = new aws.S3();

exports.handler = function(event, context,callback) {
    var destinationKey =event.file,
        destinationBucket = 'catalyst-ui-ux';
		
		if(event===null ){
		    callback(Error, "invalid method");
            context.done();
		}
		 s3.deleteObjects({
                            Bucket: destinationBucket,
                            Delete:{
                                Objects:[
                                    {Key: destinationKey}
                                    ] 
                                }                   
                    }, function(err, data) {
                        if (err)
                            return console.log(err);
                            
                        });
                    context.done();
                
    };