# .gitpod.Dockerfile

FROM gitpod/workspace-full

# Install Miniconda
RUN curl -o Miniconda.sh -LO https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && \
    bash Miniconda.sh -b -p $HOME/miniconda && \
    rm Miniconda.sh

# Install Fish shell
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Add Miniconda to PATH
ENV PATH=$HOME/miniconda/bin:$PATH

# Initialize Conda
RUN conda init bash

# Automatically activate the Conda environment on Gitpod workspace start
ENV CONDA_AUTO_ACTIVATE=true
ENV CONDA_DEFAULT_ENV=base

# Set Fish as the default shell
ENV SHELL=/usr/bin/fish