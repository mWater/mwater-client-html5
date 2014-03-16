# THIS VERSION IS NOW SUPERCEDED BY VERSION 3

See https://github.com/mWater/app-v3

-------

Copyright 2012 mWater

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

-------------

h1. Building

Release builds are done using ant. "ant build" makes a version with optimized JavaScript in
build folder.

"ant release" does an official release, automatically incrementing the application version number
and making a zip file.

h1. Getting started

The app is styled with Twitter Bootstrap. It loads as a single HTML page. Templating is done 
with dust.js. Switching between "pages" is done with a custom library Pager.js

The app both supports a local SQLite database and online-only capability depending on the
options passed into Application.
