terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-2"
}

resource "aws_vpc" "paytrack_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "PayTrack-VPC"
  }
}

resource "aws_subnet" "paytrack_subnet" {
  vpc_id                  = aws_vpc.paytrack_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-southeast-2a"
  map_public_ip_on_launch = true

  tags = {
    Name = "PayTrack-Public-Subnet"
  }
}
resource "aws_internet_gateway" "paytrack_igw" {
  vpc_id = aws_vpc.paytrack_vpc.id

  tags = {
    Name = "PayTrack-Internet-Gateway"
  }
}
resource "aws_route_table" "paytrack_route_table" {
  vpc_id = aws_vpc.paytrack_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.paytrack_igw.id
  }

  tags = {
    Name = "PayTrack-Public-Route-Table"
  }
}

resource "aws_route_table_association" "paytrack_route_association" {
  subnet_id      = aws_subnet.paytrack_subnet.id
  route_table_id = aws_route_table.paytrack_route_table.id
}
resource "aws_security_group" "paytrack_sg" {
  name        = "PayTrack-Security-Group"
  description = "Restricted access for PayTrack EC2"
  vpc_id      = aws_vpc.paytrack_vpc.id

  ingress {
    description = "SSH from my IP only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["128.185.168.201/32"]
  }

  ingress {
    description = "HTTP access for college demonstration"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "PayTrack-Security-Group"
  }
}
resource "aws_instance" "paytrack_ec2" {
  ami                         = "ami-0ecd485ef602f1761"
  instance_type               = "t4g.micro"
  subnet_id                   = aws_subnet.paytrack_subnet.id
  vpc_security_group_ids      = [aws_security_group.paytrack_sg.id]
  key_name                    = "paytrack-key"
  associate_public_ip_address = true

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  tags = {
    Name = "PayTrack-EC2"
  }
}
output "vpc_id" {
  value = aws_vpc.paytrack_vpc.id
}

output "subnet_id" {
  value = aws_subnet.paytrack_subnet.id
}
output "ec2_public_ip" {
  value = aws_instance.paytrack_ec2.public_ip
}