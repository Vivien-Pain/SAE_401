-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : sae-mysql
-- Généré le : mer. 09 avr. 2025 à 07:08
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
('DoctrineMigrations\\Version20250407071818', '2025-04-07 07:18:25', 45),
('DoctrineMigrations\\Version20250408073857', '2025-04-08 07:39:04', 38),
('DoctrineMigrations\\Version20250408074652', '2025-04-08 07:46:58', 61),
('DoctrineMigrations\\Version20250408085808', '2025-04-08 08:58:15', 48),
('DoctrineMigrations\\Version20250408131054', '2025-04-08 13:11:09', 54),
('DoctrineMigrations\\Version20250408140001', '2025-04-08 14:00:07', 169);

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `id` int NOT NULL,
  `recipient_id` int NOT NULL,
  `sender_id` int DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb3_unicode_ci NOT NULL,
  `post_id` int DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `notification`
--

INSERT INTO `notification` (`id`, `recipient_id`, `sender_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES
(1, 2, 14, 'like', 79, 0, '2025-04-08 14:32:24'),
(2, 2, 14, 'like', 72, 0, '2025-04-08 14:32:27');

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
  `is_pinned` tinyint(1) NOT NULL,
  `is_locked` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `post`
--

INSERT INTO `post` (`id`, `content`, `created_at`, `author_id`, `media`, `parent_id`, `is_censored`, `is_pinned`, `is_locked`) VALUES
(2, 'Deuxième post avec du contenu intéressant.', '2025-03-19 07:21:20', 2, NULL, NULL, 0, 0, 0),
(3, 'Un autre post pour remplir la base de données.', '2025-03-19 07:21:20', 2, NULL, NULL, 0, 0, 0),
(4, 'Encore un post pour tester le fil d\'actualité.', '2025-03-19 07:21:20', 2, NULL, NULL, 0, 0, 0),
(5, 'Dernier post d\'exemple pour le moment.', '2025-03-19 07:21:20', 2, NULL, NULL, 0, 0, 0),
(7, 'Maud Je t\'aime <3', '2025-03-20 13:52:39', 2, NULL, NULL, 0, 0, 0),
(8, 'Scroll non ?!', '2025-03-20 14:14:31', 2, NULL, NULL, 0, 0, 0),
(14, 'blabla', '2025-03-24 10:47:15', 2, '[]', NULL, 0, 0, 0),
(18, 'Post pour le post qui psot', '2025-03-24 10:47:15', 2, '[]', NULL, 0, 0, 0),
(19, 'Je vais essayer un nouveau sport ce mois-ci. Qui est partant pour un match de tennis ? ', '2025-03-24 10:47:15', 2, NULL, NULL, 0, 0, 0),
(20, 'Les nouvelles tendances en design graphique sont vraiment intéressantes cette année. J\'ai hâte de voir où cela va nous mener.', '2025-03-24 10:47:15', 2, NULL, NULL, 0, 0, 0),
(21, 'L\'intelligence artificielle est un sujet fascinant. Comment pensez-vous que cela va impacter nos vies ?', '2025-03-24 10:47:15', 2, NULL, NULL, 0, 0, 0),
(39, 'Fleur !', '2025-04-01 08:49:49', 14, NULL, NULL, 0, 0, 0),
(40, 'Rose !', '2025-04-01 08:50:37', 14, NULL, NULL, 0, 0, 0),
(41, 'a', '2025-04-01 08:51:02', 14, NULL, NULL, 1, 0, 0),
(52, 'Mustang !', '2025-04-02 12:21:15', 2, '[\"/uploads/media/67ed2bbb251f1.jpg\"]', NULL, 0, 0, 1),
(72, '#JesuisBrad', '2025-04-07 08:13:08', 2, '[]', NULL, 0, 1, 0),
(79, 'Je suis d\'accord ! ', '2025-04-08 07:10:01', 2, '[]', 40, 0, 0, 0),
(86, 'Nous somme la meilleur équipes ', '2025-04-08 08:52:37', 15, '[]', NULL, 0, 0, 0),
(87, 'Dralii, Vatira, Atow on rouler sur le major de RL ', '2025-04-08 08:53:17', 15, '[]', NULL, 0, 0, 0),
(89, 'lest go !', '2025-04-08 09:28:16', 2, '[]', 87, 0, 0, 0);

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
(40, 2),
(52, 2),
(52, 14),
(72, 2),
(72, 14),
(79, 14),
(89, 14);

-- --------------------------------------------------------

--
-- Structure de la table `subscription`
--

CREATE TABLE `subscription` (
  `id` int NOT NULL,
  `follower_id` int NOT NULL,
  `followed_id` int NOT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `subscription`
--

INSERT INTO `subscription` (`id`, `follower_id`, `followed_id`, `is_approved`) VALUES
(37, 12, 2, 0),
(38, 14, 2, 0),
(39, 2, 12, 0);

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
  `read_only_mode` tinyint(1) NOT NULL DEFAULT '0',
  `is_private` tinyint(1) NOT NULL DEFAULT '0',
  `only_followers_can_comment` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `password`, `api_token`, `roles`, `bio`, `profile_picture`, `banner`, `location`, `website`, `is_blocked`, `read_only_mode`, `is_private`, `only_followers_can_comment`) VALUES
(2, 'Vivien', 'vivienpain@gmail.com', '$2y$12$9l7V2ud/2hfsaiD2dUzvTuj6HJ.t2NPrrr5pyBePS5MYldd3Fzrea', '6d574baeb9d40249fb66e13117103861016f5d0494e342233696a48e4589e734', 'admin', 'Bonjour je suis Vivien Pain ', 'https://moto.honda.fr/content/dam/central/motorcycles/Homepage/25ym/25ym_cb1000_hornet_homepage_1280x1280.jpg/_jcr_content/renditions/m_r.jpg', 'https://catch-news.com/images/2025/02/28/wwe-change-plans-smackdown-28-fevrier-2025.jpg', 'Limoges ', 'http://localhost:8090/api/profile/Vivien', 0, 0, 0, 0),
(12, 'Lucas', 'lucasetvivien@hotmail.fr', '$2y$12$mY3Q3yzK0P.2Z7qxfhzwjuaE02mrp4m.6MjuUnOXzsFerFUBc/FmG', 'b57a2d3cc244ea16947008afd1f4dae48f1d152bbc4c150ca5397071d0c4b125', '', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 0),
(13, 'Test', 'Test@gmail.com', '$2y$12$IDRLnAXBk7YIXNxsP1YuPuhWOMhSq0jwwOCvYY4/5oAQECifZyQRe', 'd7992426d53be04e062b27661ba55b9e08587c14d9a512605c5905c4719a1cff', '', NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0),
(14, 'Maud', 'maud.raux4@gmail.com', '$2y$12$eWszFFKv4KvuSB1ldLxjJOhCSBe/bpqsdNboqhMoVk9LGvkpO/z56', '628c3332fc3e7ed146a3c14920fd238af84968e79648a729137f44b4ce6667ce', 'admin', 'Fleur', 'https://cdn.jacques-briant.fr/1066/pivoine-sarah-bernhardt.jpg', 'https://img.freepik.com/photos-premium/banniere-texture-pivoines-delicates-roses-fond-romantique-fond_464863-987.jpg', NULL, NULL, 0, 0, 0, 0),
(15, 'Karmine', 'KarmineGoat@gmail.com', '$2y$12$r1oHo6KwyqkEkSznRyXAVOmKen559jYOA0OiQr6l51w1UEStPRKpG', 'a2e7b29f08b73b93fa1422b6bc9f2559d36b43444b79624b916bf6a30191f739', '', 'On a tout gagner', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJJPeEc_cVOYZDztexD7Q6w9LHGG4mvDSoyQ&s', 'https://pbs.twimg.com/media/FJZzMxGXsAAmSRE.jpg:large', 'Karmine', 'https://www.karminecorp.fr/', 0, 0, 0, 0);

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
-- Index pour la table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_BF5476CAE92F8F78` (`recipient_id`),
  ADD KEY `IDX_BF5476CAF624B39D` (`sender_id`);

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
-- AUTO_INCREMENT pour la table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `post`
--
ALTER TABLE `post`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT pour la table `subscription`
--
ALTER TABLE `subscription`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
-- Contraintes pour la table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `FK_BF5476CAE92F8F78` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_BF5476CAF624B39D` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`);

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
