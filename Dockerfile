# Use the official Node.js image as a parent image
FROM node:18 

# Set the working directory within the docker image
WORKDIR /usr/src/app 

# Copy the current directory contents into the container at /usr/src/app
COPY . . 

# Install any needed packages for C++ build
RUN apt-get update && apt-get install -y \
build-essential 

# Build the C++ application
# UNAME_M=arm64 UNAME_p=arm LLAMA_NO_METAL=1 make is used to build for Mac ARM64 architecture
RUN cd llama.cpp && make clean && UNAME_M=arm64 UNAME_p=arm LLAMA_NO_METAL=1 make 

RUN chmod +x llama.cpp/main

# Install Node.js dependencies
RUN npm install 

# Make port 80 available to the world outside this container
EXPOSE 80 

# Run server.js when the container launches
CMD ["node", "server.js"] 
