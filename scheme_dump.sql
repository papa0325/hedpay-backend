--
-- PostgreSQL database dump
--

-- Dumped from database version 10.12 (Ubuntu 10.12-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.12 (Ubuntu 10.12-0ubuntu0.18.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: ActiveConnections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ActiveConnections" (
    id character varying(255) NOT NULL,
    "userId" character varying(255) NOT NULL,
    "connectionTime" timestamp with time zone
);

--
-- Name: ComingSoonSubscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ComingSoonSubscribers" (
    email character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."ComingSoonSubscribers" OWNER TO postgres;

--
-- Name: Currencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Currencies" (
    id character varying(255) NOT NULL,
    symbol character varying(255),
    "fullTitle" character varying(255),
    decimals integer,
    "currentRate" character varying(255),
    "txLimits" jsonb DEFAULT '{}'::jsonb,
    fiat boolean DEFAULT false,
    "parentId" character varying(255),
    meta jsonb DEFAULT '{}'::jsonb,
    change character varying(255) DEFAULT NULL::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Currencies" OWNER TO postgres;

--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notifications" (
    id character varying(255) NOT NULL,
    "userId" character varying(255),
    seen boolean DEFAULT false,
    type integer,
    meta jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    transport integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Notifications" OWNER TO postgres;

--
-- Name: Orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Orders" (
    id character varying(255) NOT NULL,
    "userId" character varying(255) NOT NULL,
    "pairName" character varying(255),
    side integer,
    amount numeric(40,20),
    "unitPrice" numeric(40,20),
    status integer,
    "leftSideSymbolId" character varying(255),
    "rightSideSymbolId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "productId" character varying(255)
);


ALTER TABLE public."Orders" OWNER TO postgres;

--
-- Name: Packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Packages" (
    id character varying(255) NOT NULL,
    amount integer,
    months integer,
    percentage integer,
    "leftAmount" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Packages" OWNER TO postgres;

--
-- Name: RatesHistories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RatesHistories" (
    id character varying(255) NOT NULL,
    "currencyId" character varying(255),
    rate character varying(255),
    volume character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."RatesHistories" OWNER TO postgres;

--
-- Name: Referrals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Referrals" (
    id character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" character varying(255) NOT NULL,
    "refId" character varying(255) NOT NULL
);


ALTER TABLE public."Referrals" OWNER TO postgres;

--
-- Name: Rewards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Rewards" (
    id character varying(255) NOT NULL,
    "currencyId" character varying(255),
    amount character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    "percentRewardForTransaction" integer,
    "payRewardForTransaction" boolean,
    "payRewardFixed" boolean
);


ALTER TABLE public."Rewards" OWNER TO postgres;

--
-- Name: Sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sessions" (
    id character varying(255) NOT NULL,
    "userId" character varying(255),
    "lastUsedDate" timestamp with time zone,
    "lastUsedIp" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Sessions" OWNER TO postgres;

--
-- Name: Staking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Staking" (
    id character varying(255) NOT NULL,
    min numeric,
    max numeric,
    price numeric,
    percentage numeric,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Staking" OWNER TO postgres;

--
-- Name: StakingRewards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StakingRewards" (
    id character varying(255) NOT NULL,
    "userId" character varying(255) NOT NULL,
    "stakeId" character varying(255) NOT NULL,
    amount character varying(255) DEFAULT '0'::character varying NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."StakingRewards" OWNER TO postgres;

--
-- Name: TokenDistributionSessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TokenDistributionSessions" (
    id character varying(255) NOT NULL,
    "sessionName" character varying(255),
    "boughtAmount" numeric(40,20),
    "leftAmount" numeric(40,20),
    active boolean DEFAULT true,
    "startAt" timestamp with time zone,
    "expiresAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TokenDistributionSessions" OWNER TO postgres;

--
-- Name: TokenDistributionSessionsPacks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TokenDistributionSessionsPacks" (
    id character varying(255) NOT NULL,
    "sessionID" character varying(255),
    min numeric(40,20),
    max numeric(40,20),
    price numeric(40,20),
    "limit" numeric(40,20),
    "currencyID" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "lastCounterDropTime" timestamp with time zone,
    "counterInterval" integer
);


ALTER TABLE public."TokenDistributionSessionsPacks" OWNER TO postgres;

--
-- Name: Transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transactions" (
    id character varying(255) NOT NULL,
    status integer DEFAULT 0,
    amount double precision,
    type integer,
    "to" character varying(255),
    description character varying(255),
    meta jsonb DEFAULT '{}'::jsonb,
    "currencyId" character varying(255),
    "walletId" character varying(255),
    "userId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "orderId" character varying(255)
);


ALTER TABLE public."Transactions" OWNER TO postgres;

--
-- Name: UserPackages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserPackages" (
    id character varying(255) NOT NULL,
    "userId" character varying(255),
    amount integer,
    percentage integer,
    "expireDate" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserPackages" OWNER TO postgres;

--
-- Name: UserRefReward; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserRefReward" (
    id character varying(255) NOT NULL,
    "rewardId" character varying(255),
    "userId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "lastWithdraw" timestamp with time zone,
    amount character varying(255) DEFAULT '0'::character varying NOT NULL,
    "withdrawnAmount" character varying(255) DEFAULT '0'::character varying NOT NULL,
    "usersCount" integer DEFAULT 0 NOT NULL,
    "invitationCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."UserRefReward" OWNER TO postgres;

--
-- Name: UserStaking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserStaking" (
    id character varying(255) NOT NULL,
    amount numeric,
    "unlockDate" timestamp with time zone,
    "userId" character varying(255),
    "stakeId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "rewardCount" integer DEFAULT 0 NOT NULL,
    "totalRewardAmount" numeric(40,20) DEFAULT 0 NOT NULL
);


ALTER TABLE public."UserStaking" OWNER TO postgres;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id character varying(255) NOT NULL,
    email character varying(255),
    password character varying(255),
    avatar text,
    "firstName" character varying(255),
    "lastName" character varying(255),
    username character varying(255),
    phone character varying(255),
    settings jsonb DEFAULT '{}'::jsonb,
    status integer DEFAULT 0,
    banned boolean DEFAULT FALSE,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "refLink" character varying(255)
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: Wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wallets" (
    id character varying(255) NOT NULL,
    balance character varying(255),
    "userId" character varying(255),
    "currencyId" character varying(255),
    settings jsonb DEFAULT '{}'::jsonb,
    address character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Wallets" OWNER TO postgres;
--
-- Name: ActiveConnections ActiveConnections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ActiveConnections"
    ADD CONSTRAINT "ActiveConnections_pkey" PRIMARY KEY (id);


--
-- Name: ComingSoonSubscribers ComingSoonSubscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ComingSoonSubscribers"
    ADD CONSTRAINT "ComingSoonSubscribers_pkey" PRIMARY KEY (email);


--
-- Name: Currencies Currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Currencies"
    ADD CONSTRAINT "Currencies_pkey" PRIMARY KEY (id);


--
-- Name: Notifications Notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_pkey" PRIMARY KEY (id);


--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- Name: Packages Packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Packages"
    ADD CONSTRAINT "Packages_pkey" PRIMARY KEY (id);


--
-- Name: RatesHistories RatesHistories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RatesHistories"
    ADD CONSTRAINT "RatesHistories_pkey" PRIMARY KEY (id);


--
-- Name: Referrals Referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Referrals"
    ADD CONSTRAINT "Referrals_pkey" PRIMARY KEY (id);


--
-- Name: Rewards Rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rewards"
    ADD CONSTRAINT "Rewards_pkey" PRIMARY KEY (id);


--
-- Name: Sessions Sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sessions"
    ADD CONSTRAINT "Sessions_pkey" PRIMARY KEY (id);


--
-- Name: StakingRewards StakingRewards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StakingRewards"
    ADD CONSTRAINT "StakingRewards_pkey" PRIMARY KEY (id);


--
-- Name: Staking Staking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Staking"
    ADD CONSTRAINT "Staking_pkey" PRIMARY KEY (id);


--
-- Name: TokenDistributionSessionsPacks TokenDistributionSessionsPacks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TokenDistributionSessionsPacks"
    ADD CONSTRAINT "TokenDistributionSessionsPacks_pkey" PRIMARY KEY (id);


--
-- Name: TokenDistributionSessions TokenDistributionSessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TokenDistributionSessions"
    ADD CONSTRAINT "TokenDistributionSessions_pkey" PRIMARY KEY (id);


--
-- Name: Transactions Transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_pkey" PRIMARY KEY (id);


--
-- Name: UserPackages UserPackages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserPackages"
    ADD CONSTRAINT "UserPackages_pkey" PRIMARY KEY (id);


--
-- Name: UserRefReward UserRefReward_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRefReward"
    ADD CONSTRAINT "UserRefReward_pkey" PRIMARY KEY (id);


--
-- Name: UserStaking UserStaking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStaking"
    ADD CONSTRAINT "UserStaking_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_refLink_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_refLink_key" UNIQUE ("refLink");


--
-- Name: Wallets Wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_pkey" PRIMARY KEY (id);


--
-- Name: transactions_user_id_wallet_id_currency_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_user_id_wallet_id_currency_id ON public."Transactions" USING btree ("userId", "walletId", "currencyId");


--
-- Name: wallets_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wallets_address ON public."Wallets" USING btree (address);


--
-- Name: Notifications Notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RatesHistories RatesHistories_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RatesHistories"
    ADD CONSTRAINT "RatesHistories_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currencies"(id) ON UPDATE CASCADE;


--
-- Name: Rewards Rewards_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rewards"
    ADD CONSTRAINT "Rewards_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currencies"(id) ON UPDATE CASCADE;


--
-- Name: Sessions Sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sessions"
    ADD CONSTRAINT "Sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TokenDistributionSessionsPacks TokenDistributionSessionsPacks_sessionID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TokenDistributionSessionsPacks"
    ADD CONSTRAINT "TokenDistributionSessionsPacks_sessionID_fkey" FOREIGN KEY ("sessionID") REFERENCES public."TokenDistributionSessions"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transactions Transactions_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currencies"(id) ON UPDATE CASCADE;


--
-- Name: Transactions Transactions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transactions Transactions_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Wallets"(id) ON UPDATE CASCADE;


--
-- Name: UserRefReward UserRefReward_rewardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRefReward"
    ADD CONSTRAINT "UserRefReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES public."Rewards"(id) ON UPDATE CASCADE;


--
-- Name: UserRefReward UserRefReward_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRefReward"
    ADD CONSTRAINT "UserRefReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserStaking UserStaking_stakeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStaking"
    ADD CONSTRAINT "UserStaking_stakeId_fkey" FOREIGN KEY ("stakeId") REFERENCES public."Staking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserStaking UserStaking_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStaking"
    ADD CONSTRAINT "UserStaking_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wallets Wallets_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currencies"(id) ON UPDATE CASCADE;


--
-- Name: Wallets Wallets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TokenDistributionSessionsPacks distribution_currency_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TokenDistributionSessionsPacks"
    ADD CONSTRAINT distribution_currency_fk FOREIGN KEY ("currencyID") REFERENCES public."Currencies"(id);


--
-- Name: TokenDistributionSessionsPacks distribution_session_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TokenDistributionSessionsPacks"
    ADD CONSTRAINT distribution_session_fk FOREIGN KEY ("sessionID") REFERENCES public."TokenDistributionSessions"(id) ON DELETE CASCADE;


--
-- Name: Orders order_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT order_user_id_fk FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: UserRefReward ref_reward_rew_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRefReward"
    ADD CONSTRAINT ref_reward_rew_id_fk FOREIGN KEY ("rewardId") REFERENCES public."Rewards"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRefReward ref_reward_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRefReward"
    ADD CONSTRAINT ref_reward_user_id_fk FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referrals referrals_ref_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Referrals"
    ADD CONSTRAINT referrals_ref_id_fk FOREIGN KEY ("refId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referrals referrals_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Referrals"
    ADD CONSTRAINT referrals_user_id_fk FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserStaking stake_user_stake_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStaking"
    ADD CONSTRAINT stake_user_stake_id_fk FOREIGN KEY ("stakeId") REFERENCES public."Staking"(id) ON DELETE CASCADE;


--
-- Name: StakingRewards staking_rew_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StakingRewards"
    ADD CONSTRAINT staking_rew_id_fk FOREIGN KEY ("stakeId") REFERENCES public."UserStaking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StakingRewards staking_reward_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StakingRewards"
    ADD CONSTRAINT staking_reward_user_id_fk FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserStaking user_user_stake_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStaking"
    ADD CONSTRAINT user_user_stake_id_fk FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

