## CentOS 8.2

mysql --version

### Install the MySQL Repository Configuration Package

First, download and install the MySQL repository configuration package for CentOS 8.2:

```
sudo dnf install https://dev.mysql.com/get/mysql80-community-release-el8-3.noarch.rpm
```

### Install the MySQL Client:

After installing the repository configuration, you can install the MySQL 8.0 client using the following command:

```
sudo dnf install mysql-community-client
```

### Verify the Installation:

Check that the MySQL client has been successfully installed:

```
mysql --version
```

### Connect to MySQL:

You can access the MySQL command-line client using the following command:

```
mysql -u root -p
```

Enter the root password you've set during the MySQL secure installation to access the MySQL shell.
