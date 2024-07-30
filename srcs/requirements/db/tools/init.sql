-- Connexion à la base de données
-- Utilisation des commandes SQL pour créer les tables

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    auth VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserProfiles (
    user_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    profile_picture VARCHAR(255),
    total_tournaments INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    total_draws INT DEFAULT 0,
    highest_score INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES Users(id)
);

CREATE TABLE TournamentParticipants (
    id SERIAL PRIMARY KEY,
    tournament_id INT,
    user_id INT,
    score INT DEFAULT 0,
    FOREIGN KEY (tournament_id) REFERENCES Tournaments(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE TournamentResults (
    id SERIAL PRIMARY KEY,
    tournament_id INT,
    user_id INT,
    score INT DEFAULT 0,
    position INT DEFAULT 0,
    matches_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    draws INT DEFAULT 0,
    FOREIGN KEY (tournament_id) REFERENCES Tournaments(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE GameCustomization (
    id SERIAL PRIMARY KEY,
    user_id INT,
    settings JSON,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE DeviceSupport (
    id SERIAL PRIMARY KEY,
    device_type VARCHAR(50),
    os VARCHAR(50),
    browser VARCHAR(50),
    is_supported BOOLEAN DEFAULT TRUE
);

CREATE TABLE BrowserCompatibility (
    id SERIAL PRIMARY KEY,
    browser_name VARCHAR(50),
    version VARCHAR(50),
    is_compatible BOOLEAN DEFAULT TRUE
);
