CREATE DATABASE  IF NOT EXISTS `bbdd_web` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bbdd_web`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: bbdd_web
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `consulta`
--

DROP TABLE IF EXISTS `consulta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consulta` (
  `idConsulta` int NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT NULL,
  `idMedico` int DEFAULT NULL,
  `idFichaMedica` int DEFAULT NULL,
  `institucionMedica` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idConsulta`),
  KEY `idMedico` (`idMedico`),
  KEY `idFichaMedica` (`idFichaMedica`),
  CONSTRAINT `consulta_ibfk_1` FOREIGN KEY (`idMedico`) REFERENCES `medico` (`idMedico`),
  CONSTRAINT `consulta_ibfk_2` FOREIGN KEY (`idFichaMedica`) REFERENCES `fichamedica` (`idFichaMedica`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consulta`
--

LOCK TABLES `consulta` WRITE;
/*!40000 ALTER TABLE `consulta` DISABLE KEYS */;
INSERT INTO `consulta` VALUES (1,'2025-05-10 09:00:00',1,1,'Consultorio A','Chequeo general'),(2,'2025-05-15 11:00:00',2,1,'Hospital Central','Control de hipertensión'),(3,'2025-06-01 14:00:00',3,1,'Clínica del Sol','Revisión de diabetes'),(4,'2025-06-20 10:00:00',4,1,'Consultorio B','Consulta internista por fatiga');
/*!40000 ALTER TABLE `consulta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultamedicamento`
--

DROP TABLE IF EXISTS `consultamedicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultamedicamento` (
  `idMedicamento` int NOT NULL,
  `idConsulta` int NOT NULL,
  `cantidad` int DEFAULT NULL,
  `formato` varchar(255) DEFAULT NULL,
  `tiempoConsumo` int DEFAULT NULL,
  `frecuenciaConsumo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idMedicamento`,`idConsulta`),
  KEY `idConsulta` (`idConsulta`),
  CONSTRAINT `consultamedicamento_ibfk_1` FOREIGN KEY (`idMedicamento`) REFERENCES `medicamento` (`idMedicamento`),
  CONSTRAINT `consultamedicamento_ibfk_2` FOREIGN KEY (`idConsulta`) REFERENCES `consulta` (`idConsulta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultamedicamento`
--

LOCK TABLES `consultamedicamento` WRITE;
/*!40000 ALTER TABLE `consultamedicamento` DISABLE KEYS */;
INSERT INTO `consultamedicamento` VALUES (1,1,20,'Comprimidos',7,'Cada 8 horas'),(2,2,30,'Comprimidos',30,'Cada 24 horas'),(3,3,60,'Comprimidos',60,'Cada 12 horas');
/*!40000 ALTER TABLE `consultamedicamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultaprocedimiento`
--

DROP TABLE IF EXISTS `consultaprocedimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultaprocedimiento` (
  `idConsulta` int NOT NULL,
  `idProcedimiento` int NOT NULL,
  PRIMARY KEY (`idConsulta`,`idProcedimiento`),
  KEY `idProcedimiento` (`idProcedimiento`),
  CONSTRAINT `consultaprocedimiento_ibfk_1` FOREIGN KEY (`idConsulta`) REFERENCES `consulta` (`idConsulta`),
  CONSTRAINT `consultaprocedimiento_ibfk_2` FOREIGN KEY (`idProcedimiento`) REFERENCES `procedimiento` (`idProcedimiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultaprocedimiento`
--

LOCK TABLES `consultaprocedimiento` WRITE;
/*!40000 ALTER TABLE `consultaprocedimiento` DISABLE KEYS */;
INSERT INTO `consultaprocedimiento` VALUES (1,2),(4,2);
/*!40000 ALTER TABLE `consultaprocedimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnostico`
--

DROP TABLE IF EXISTS `diagnostico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnostico` (
  `idDiagnostico` int NOT NULL AUTO_INCREMENT,
  `idFichaMedica` int DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idDiagnostico`),
  KEY `idFichaMedica` (`idFichaMedica`),
  CONSTRAINT `diagnostico_ibfk_1` FOREIGN KEY (`idFichaMedica`) REFERENCES `fichamedica` (`idFichaMedica`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnostico`
--

LOCK TABLES `diagnostico` WRITE;
/*!40000 ALTER TABLE `diagnostico` DISABLE KEYS */;
INSERT INTO `diagnostico` VALUES (1,1,'2025-05-10 09:30:00','Paciente estable, sin síntomas agudos.'),(2,1,'2025-05-15 11:30:00','Hipertensión controlada con medicación.'),(3,1,'2025-06-01 14:30:00','Nivel de glucosa dentro de los rangos aceptables.'),(4,1,'2025-06-20 10:30:00','Fatiga posiblemente asociada a estrés y falta de sueño.');
/*!40000 ALTER TABLE `diagnostico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fichamedica`
--

DROP TABLE IF EXISTS `fichamedica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fichamedica` (
  `idFichaMedica` int NOT NULL AUTO_INCREMENT,
  `Rut` int DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `fechaNacimiento` date DEFAULT NULL,
  `sexo` varchar(100) DEFAULT NULL,
  `tipoSangre` varchar(10) DEFAULT NULL,
  `altura` float DEFAULT NULL,
  `peso` float DEFAULT NULL,
  `genero` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idFichaMedica`),
  UNIQUE KEY `Rut` (`Rut`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fichamedica`
--

LOCK TABLES `fichamedica` WRITE;
/*!40000 ALTER TABLE `fichamedica` DISABLE KEYS */;
INSERT INTO `fichamedica` VALUES (1,1234,'luis','2025-09-01','male','+O',123,123,'male'),(2,1,'nicolas','2025-09-04','male','B-',1,1,'male'),(3,12345678,'Juan Pérez','1985-07-20','Masculino','O+',1.75,72,'Masculino');
/*!40000 ALTER TABLE `fichamedica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fichamedicapadecimiento`
--

DROP TABLE IF EXISTS `fichamedicapadecimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fichamedicapadecimiento` (
  `idFichaMedica` int NOT NULL,
  `idPadecimiento` int NOT NULL,
  `fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`idFichaMedica`,`idPadecimiento`),
  KEY `idPadecimiento` (`idPadecimiento`),
  CONSTRAINT `fichamedicapadecimiento_ibfk_1` FOREIGN KEY (`idFichaMedica`) REFERENCES `fichamedica` (`idFichaMedica`),
  CONSTRAINT `fichamedicapadecimiento_ibfk_2` FOREIGN KEY (`idPadecimiento`) REFERENCES `padecimiento` (`idPadecimiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fichamedicapadecimiento`
--

LOCK TABLES `fichamedicapadecimiento` WRITE;
/*!40000 ALTER TABLE `fichamedicapadecimiento` DISABLE KEYS */;
INSERT INTO `fichamedicapadecimiento` VALUES (1,1,'2020-01-15 00:00:00'),(1,2,'2018-06-20 00:00:00'),(1,3,'2025-03-01 00:00:00');
/*!40000 ALTER TABLE `fichamedicapadecimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospitalizacion`
--

DROP TABLE IF EXISTS `hospitalizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hospitalizacion` (
  `idHospitalizacion` int NOT NULL AUTO_INCREMENT,
  `idFichaMedica` int DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `duracion` int DEFAULT NULL,
  `institucionMedica` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idHospitalizacion`),
  KEY `idFichaMedica` (`idFichaMedica`),
  CONSTRAINT `hospitalizacion_ibfk_1` FOREIGN KEY (`idFichaMedica`) REFERENCES `fichamedica` (`idFichaMedica`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospitalizacion`
--

LOCK TABLES `hospitalizacion` WRITE;
/*!40000 ALTER TABLE `hospitalizacion` DISABLE KEYS */;
INSERT INTO `hospitalizacion` VALUES (1,1,'2022-04-10 10:00:00',5,'Hospital Central'),(2,1,'2023-09-01 15:00:00',3,'Clínica del Sol');
/*!40000 ALTER TABLE `hospitalizacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicamento`
--

DROP TABLE IF EXISTS `medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicamento` (
  `idMedicamento` int NOT NULL AUTO_INCREMENT,
  `idTipoMedicamento` int DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idMedicamento`),
  KEY `idTipoMedicamento` (`idTipoMedicamento`),
  CONSTRAINT `medicamento_ibfk_1` FOREIGN KEY (`idTipoMedicamento`) REFERENCES `tipomedicamento` (`idTipoMedicamento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamento`
--

LOCK TABLES `medicamento` WRITE;
/*!40000 ALTER TABLE `medicamento` DISABLE KEYS */;
INSERT INTO `medicamento` VALUES (1,1,'Amoxicilina','Antibiótico de amplio espectro'),(2,2,'Enalapril','Control de presión arterial'),(3,3,'Metformina','Control de glucosa');
/*!40000 ALTER TABLE `medicamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medico`
--

DROP TABLE IF EXISTS `medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medico` (
  `idMedico` int NOT NULL AUTO_INCREMENT,
  `idTipoMedico` int DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `rut` varchar(255) DEFAULT NULL,
  `fechaNacimiento` date DEFAULT NULL,
  `sexo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idMedico`),
  KEY `idTipoMedico` (`idTipoMedico`),
  CONSTRAINT `medico_ibfk_1` FOREIGN KEY (`idTipoMedico`) REFERENCES `tipomedico` (`idTipoMedico`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medico`
--

LOCK TABLES `medico` WRITE;
/*!40000 ALTER TABLE `medico` DISABLE KEYS */;
INSERT INTO `medico` VALUES (1,1,'Dr. Ricardo Gómez','11111111-1','1975-02-10','Masculino'),(2,2,'Dra. Carolina Ruiz','22222222-2','1980-08-15','Femenino'),(3,3,'Dr. Alberto Sánchez','33333333-3','1978-12-05','Masculino'),(4,4,'Dra. Valentina Torres','44444444-4','1982-05-20','Femenino');
/*!40000 ALTER TABLE `medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `padecimiento`
--

DROP TABLE IF EXISTS `padecimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `padecimiento` (
  `idPadecimiento` int NOT NULL AUTO_INCREMENT,
  `idTipoPadecimiento` int DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idPadecimiento`),
  KEY `idTipoPadecimiento` (`idTipoPadecimiento`),
  CONSTRAINT `padecimiento_ibfk_1` FOREIGN KEY (`idTipoPadecimiento`) REFERENCES `tipopadecimiento` (`idTipoPadecimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `padecimiento`
--

LOCK TABLES `padecimiento` WRITE;
/*!40000 ALTER TABLE `padecimiento` DISABLE KEYS */;
INSERT INTO `padecimiento` VALUES (1,1,'Diabetes','Enfermedad crónica del metabolismo'),(2,1,'Hipertensión','Presión arterial alta'),(3,2,'Gripe','Infección viral del sistema respiratorio');
/*!40000 ALTER TABLE `padecimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procedimiento`
--

DROP TABLE IF EXISTS `procedimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procedimiento` (
  `idProcedimiento` int NOT NULL AUTO_INCREMENT,
  `idTipoProcedimiento` int DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idProcedimiento`),
  KEY `idTipoProcedimiento` (`idTipoProcedimiento`),
  CONSTRAINT `procedimiento_ibfk_1` FOREIGN KEY (`idTipoProcedimiento`) REFERENCES `tipoprocedimiento` (`idTipoProcedimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procedimiento`
--

LOCK TABLES `procedimiento` WRITE;
/*!40000 ALTER TABLE `procedimiento` DISABLE KEYS */;
INSERT INTO `procedimiento` VALUES (1,1,'Apendicectomía','Extirpación del apéndice'),(2,2,'Hemograma','Examen de sangre completo');
/*!40000 ALTER TABLE `procedimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipomedicamento`
--

DROP TABLE IF EXISTS `tipomedicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipomedicamento` (
  `idTipoMedicamento` int NOT NULL AUTO_INCREMENT,
  `tipoMedicamento` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idTipoMedicamento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipomedicamento`
--

LOCK TABLES `tipomedicamento` WRITE;
/*!40000 ALTER TABLE `tipomedicamento` DISABLE KEYS */;
INSERT INTO `tipomedicamento` VALUES (1,'Antibiótico'),(2,'Antihipertensivo'),(3,'Antidiabético');
/*!40000 ALTER TABLE `tipomedicamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipomedico`
--

DROP TABLE IF EXISTS `tipomedico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipomedico` (
  `idTipoMedico` int NOT NULL AUTO_INCREMENT,
  `tipoMedico` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idTipoMedico`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipomedico`
--

LOCK TABLES `tipomedico` WRITE;
/*!40000 ALTER TABLE `tipomedico` DISABLE KEYS */;
INSERT INTO `tipomedico` VALUES (1,'General'),(2,'Cardiólogo'),(3,'Endocrinólogo'),(4,'Internista');
/*!40000 ALTER TABLE `tipomedico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipopadecimiento`
--

DROP TABLE IF EXISTS `tipopadecimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipopadecimiento` (
  `idTipoPadecimiento` int NOT NULL AUTO_INCREMENT,
  `tipoPadecimiento` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idTipoPadecimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipopadecimiento`
--

LOCK TABLES `tipopadecimiento` WRITE;
/*!40000 ALTER TABLE `tipopadecimiento` DISABLE KEYS */;
INSERT INTO `tipopadecimiento` VALUES (1,'Crónico'),(2,'Agudo');
/*!40000 ALTER TABLE `tipopadecimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipoprocedimiento`
--

DROP TABLE IF EXISTS `tipoprocedimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipoprocedimiento` (
  `idTipoProcedimiento` int NOT NULL AUTO_INCREMENT,
  `tipoProcedimiento` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idTipoProcedimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipoprocedimiento`
--

LOCK TABLES `tipoprocedimiento` WRITE;
/*!40000 ALTER TABLE `tipoprocedimiento` DISABLE KEYS */;
INSERT INTO `tipoprocedimiento` VALUES (1,'Cirugía'),(2,'Examen de laboratorio');
/*!40000 ALTER TABLE `tipoprocedimiento` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-27 20:11:38
