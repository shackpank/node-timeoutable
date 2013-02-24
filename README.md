Timeoutable
-----------

Readme goes here, with all sorts of fun examples and such.

- Write tests around the "check we are tracking callbacks that are called 0 or 2+ times" bits
- Push the default limits for the above into config, so they can default to error early in development and never in production.
- Is there any standard way to check if your node environment is dev or production, or does that all stay in the readme?
- Investigate that __apply thing. "this" there will be "module", so maybe it will share state it shouldn't. Is there a better thing to use there, null or undefined maybe?
- Fill in the package.json a bit better