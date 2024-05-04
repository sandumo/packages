perl -i -0pe "s/<HOST>/$ZENKO_S3_HOST/" config.json
perl -i -0pe "s/<ACCESS_KEY_ID>/$ZENKO_S3_ACCESS_KEY_ID/" conf/authdata.json
perl -i -0pe "s/<SECRET_ACCESS_KEY>/$ZENKO_S3_SECRET_ACCESS_KEY/" conf/authdata.json