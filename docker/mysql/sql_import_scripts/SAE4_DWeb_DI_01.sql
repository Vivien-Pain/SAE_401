-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : sae-mysql
-- Généré le : lun. 07 avr. 2025 à 08:33
-- Version du serveur : 8.4.4
-- Version de PHP : 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `SAE4_DWeb_DI_01`
--

-- --------------------------------------------------------

--
-- Structure de la table `block`
--

CREATE TABLE `block` (
  `id` int NOT NULL,
  `blocker_id` int NOT NULL,
  `blocked_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `doctrine_migration_versions`
--

CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) COLLATE utf8mb3_unicode_ci NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20250319071845', '2025-03-19 07:19:04', 33),
('DoctrineMigrations\\Version20250320151635', '2025-03-20 15:16:50', 58),
('DoctrineMigrations\\Version20250321131212', '2025-03-21 13:12:25', 225),
('DoctrineMigrations\\Version20250324093452', '2025-03-24 09:35:04', 111),
('DoctrineMigrations\\Version20250324151745', '2025-03-24 15:18:00', 44),
('DoctrineMigrations\\Version20250325162230', '2025-03-25 16:22:38', 76),
('DoctrineMigrations\\Version20250326075401', '2025-03-26 08:57:19', 156),
('DoctrineMigrations\\Version20250326085758', '2025-03-26 09:00:33', 39),
('DoctrineMigrations\\Version20250331082212', '2025-03-31 08:22:24', 238),
('DoctrineMigrations\\Version20250401073827', '2025-04-01 07:38:47', 270),
('DoctrineMigrations\\Version20250401131031', '2025-04-01 13:10:36', 52),
('DoctrineMigrations\\Version20250401193508', '2025-04-01 19:35:23', 68),
('DoctrineMigrations\\Version20250403072523', '2025-04-03 07:25:32', 149),
('DoctrineMigrations\\Version20250403085257', '2025-04-03 08:53:18', 264),
('DoctrineMigrations\\Version20250403124811', '2025-04-03 12:48:18', 46),
('DoctrineMigrations\\Version20250404115934', '2025-04-04 11:59:46', 46),
('DoctrineMigrations\\Version20250407071818', '2025-04-07 07:18:25', 45);

-- --------------------------------------------------------

--
-- Structure de la table `post`
--

CREATE TABLE `post` (
  `id` int NOT NULL,
  `content` varchar(280) COLLATE utf8mb3_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `author_id` int NOT NULL,
  `media` json DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `is_censored` tinyint(1) NOT NULL,
  `is_pinned` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `post`
--

INSERT INTO `post` (`id`, `content`, `created_at`, `author_id`, `media`, `parent_id`, `is_censored`, `is_pinned`) VALUES
(2, 'Deuxième post avec du contenu intéressant.', '2025-03-19 07:21:20', 2, NULL, NULL, 0, 0),
(3, 'Un autre post pour remplir la base de données.', '2025-03-19 07:21:20', 2, NULL, NULL, 0, 0),
(4, 'Encore un post pour tester le fil d\'actualité.', '2025-03-19 07:21:20', 2, NULL, NULL, 0, 0),
(5, 'Dernier post d\'exemple pour le moment.', '2025-03-19 07:21:20', 2, NULL, NULL, 0, 0),
(7, 'Maud Je t\'aime <3', '2025-03-20 13:52:39', 2, NULL, NULL, 0, 0),
(8, 'Scroll non ?', '2025-03-20 14:14:31', 2, NULL, NULL, 0, 0),
(14, 'blabla', '2025-03-24 10:47:15', 2, '[]', NULL, 0, 0),
(18, 'Post pour le post qui psot', '2025-03-24 10:47:15', 2, '[]', NULL, 0, 0),
(19, 'Je vais essayer un nouveau sport ce mois-ci. Qui est partant pour un match de tennis ? ', '2025-03-24 10:47:15', 2, NULL, NULL, 0, 0),
(20, 'Les nouvelles tendances en design graphique sont vraiment intéressantes cette année. J\'ai hâte de voir où cela va nous mener.', '2025-03-24 10:47:15', 2, NULL, NULL, 0, 0),
(21, 'L\'intelligence artificielle est un sujet fascinant. Comment pensez-vous que cela va impacter nos vies ?', '2025-03-24 10:47:15', 2, NULL, NULL, 0, 0),
(39, 'Fleur !', '2025-04-01 08:49:49', 14, NULL, NULL, 0, 0),
(40, 'Rose !', '2025-04-01 08:50:37', 14, NULL, NULL, 0, 0),
(41, 'a', '2025-04-01 08:51:02', 14, NULL, NULL, 1, 0),
(52, 'Mustang !', '2025-04-02 12:21:15', 2, '[\"/uploads/media/67ed2bbb251f1.jpg\"]', NULL, 0, 1),
(72, '#JesuisBrad', '2025-04-07 08:13:08', 2, '[]', NULL, 0, 0);

-- --------------------------------------------------------

--
-- Structure de la table `post_likes`
--

CREATE TABLE `post_likes` (
  `post_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `post_likes`
--

INSERT INTO `post_likes` (`post_id`, `user_id`) VALUES
(7, 2),
(18, 2),
(19, 2),
(52, 2),
(52, 14);

-- --------------------------------------------------------

--
-- Structure de la table `subscription`
--

CREATE TABLE `subscription` (
  `id` int NOT NULL,
  `follower_id` int NOT NULL,
  `followed_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `username` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `api_token` varchar(64) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `roles` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `bio` longtext COLLATE utf8mb3_unicode_ci,
  `profile_picture` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `banner` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `is_blocked` tinyint(1) NOT NULL,
  `read_only_mode` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `password`, `api_token`, `roles`, `bio`, `profile_picture`, `banner`, `location`, `website`, `is_blocked`, `read_only_mode`) VALUES
(2, 'Vivien', 'vivienpain@gmail.com', '$2y$12$9l7V2ud/2hfsaiD2dUzvTuj6HJ.t2NPrrr5pyBePS5MYldd3Fzrea', '00ddaf6aa2ca649d62c78f76f56d5aca729ce470610d3b90d45cc5c5c5ee2a0f', 'admin', 'Bonjour je suis Vivien Pain !', 'https://moto.honda.fr/content/dam/central/motorcycles/Homepage/25ym/25ym_cb1000_hornet_homepage_1280x1280.jpg/_jcr_content/renditions/m_r.jpg', 'https://cdn.pixabay.com/photo/2021/09/12/07/58/banner-6617550_1280.png', 'Limoges 1', 'http://localhost:8090/api/profile/Vivien', 0, 0),
(12, 'Lucas', 'lucasetvivien@hotmail.fr', '$2y$12$mY3Q3yzK0P.2Z7qxfhzwjuaE02mrp4m.6MjuUnOXzsFerFUBc/FmG', 'fb1c5d68fe28a29a1480c62cb56c575921d0aac637b1edf42017dceb23561860', '', NULL, NULL, NULL, NULL, NULL, 0, 0),
(13, 'Test', 'Test@gmail.com', '$2y$12$IDRLnAXBk7YIXNxsP1YuPuhWOMhSq0jwwOCvYY4/5oAQECifZyQRe', '6b61385744987b1151a630510aed75e81302c5a695d2cce8f5d82dc30c0a3af0', '', NULL, NULL, NULL, NULL, NULL, 0, 0),
(14, 'Maud', 'maud.raux4@gmail.com', '$2y$12$eWszFFKv4KvuSB1ldLxjJOhCSBe/bpqsdNboqhMoVk9LGvkpO/z56', '3205005aa565e0b05bd73c78e1bdbb261fd78333b0315ff5967fd7f7da68468a', 'admin', 'Fleur', 'https://cdn.jacques-briant.fr/1066/pivoine-sarah-bernhardt.jpg', 'https://img.freepik.com/photos-premium/banniere-texture-pivoines-delicates-roses-fond-romantique-fond_464863-987.jpg', NULL, NULL, 0, 0);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `block`
--
ALTER TABLE `block`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_831B9722548D5975` (`blocker_id`),
  ADD KEY `IDX_831B972221FF5136` (`blocked_id`);

--
-- Index pour la table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Index pour la table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_5A8A6C8DF675F31B` (`author_id`),
  ADD KEY `IDX_5A8A6C8D727ACA70` (`parent_id`);

--
-- Index pour la table `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`post_id`,`user_id`),
  ADD KEY `IDX_DED1C2924B89032C` (`post_id`),
  ADD KEY `IDX_DED1C292A76ED395` (`user_id`);

--
-- Index pour la table `subscription`
--
ALTER TABLE `subscription`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_A3C664D3AC24F853` (`follower_id`),
  ADD KEY `IDX_A3C664D3D956F010` (`followed_id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_8D93D649F85E0677` (`username`),
  ADD UNIQUE KEY `UNIQ_8D93D649E7927C74` (`email`),
  ADD UNIQUE KEY `UNIQ_8D93D6497BA2F5EB` (`api_token`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `block`
--
ALTER TABLE `block`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `post`
--
ALTER TABLE `post`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT pour la table `subscription`
--
ALTER TABLE `subscription`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `block`
--
ALTER TABLE `block`
  ADD CONSTRAINT `FK_831B972221FF5136` FOREIGN KEY (`blocked_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_831B9722548D5975` FOREIGN KEY (`blocker_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `FK_5A8A6C8D727ACA70` FOREIGN KEY (`parent_id`) REFERENCES `post` (`id`),
  ADD CONSTRAINT `FK_5A8A6C8DF675F31B` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `FK_DED1C2924B89032C` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_DED1C292A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `subscription`
--
ALTER TABLE `subscription`
  ADD CONSTRAINT `FK_A3C664D3AC24F853` FOREIGN KEY (`follower_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_A3C664D3D956F010` FOREIGN KEY (`followed_id`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
