# Use the official PHP 8.3 FPM image as the base image
FROM php:8.3-fpm

# Set the working directory to /app
WORKDIR /app/backend

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    libonig-dev

# Install PDO MySQL extension
RUN docker-php-ext-install pdo_mysql

# Install Composer globally
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy php.ini file
COPY docker/backend/php.ini /usr/local/etc/php/conf.d/app.ini

# Expose port 9000 for PHP-FPM
EXPOSE 9000