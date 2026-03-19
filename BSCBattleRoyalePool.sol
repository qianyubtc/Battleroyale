// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMainContract {
    function referrerOf(address player) external view returns (address);
}

contract BSCBattleRoyalePool {

    uint256 public constant VERSION      = 100;
    uint256 public constant MAX_PLAYERS  = 10;
    uint256 public constant ROOM_COUNT   = 4;
    uint256 public constant MIN_FEE_RATE = 1;
    uint256 public constant MAX_FEE_RATE = 30;

    address public owner;
    address public pendingOwner;
    address public successor;
    address public mainContract;
    bool    public paused;
    bool    private _locked;

    uint256 public currentGameId;
    uint256 public feeRate;
    uint256 public minDeposit;
    uint256 public survivingRooms;
    uint256 public referralPct;
    uint256 public rebatePct;
    uint256 public accumulatedFees;
    uint256 public totalVolumeAll;
    uint256 public totalGamesPlayed;

    mapping(address => uint256) public claimable;
    mapping(address => uint256) public referralPending;
    mapping(address => uint256) public referralTotalEarned;
    mapping(address => uint256) public referralTotalWithdrawn;
    mapping(address => uint256) public rebatePending;
    mapping(address => uint256) public rebateTotalEarned;

    struct PlayerStats {
        uint256 totalGames;
        uint256 totalDeposited;
        uint256 totalWon;
        uint256 totalReferralEarned;
        uint256 totalRebateEarned;
    }
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256[])   private playerGameIds;
    mapping(uint256 => uint256)     private gameIdToIndex;

    struct RoomInfo {
        uint256 totalAmount;
        address[] players;
        mapping(address => uint256) deposits;
    }

    struct GameResult {
        uint256    gameId;
        uint256    survivingRooms;
        uint256[4] survivingRoomFlags;
        uint256    totalPot;
        uint256    feeTaken;
        uint256    distributed;
        uint256    timestamp;
        uint256    blockNumber;
        bytes32    blockHashSnapshot;
        uint256    addrEntropy;
        uint256    seedValue;
        uint256[4] roomTotals;
        uint256[4] playerCounts;
    }

    struct GameState {
        uint256 totalPlayers;
        bool    isFinished;
    }

    struct CurrentSnapshot {
        uint256    gameId;
        bool       isFinished;
        uint256    totalPlayers;
        uint256[4] roomAmounts;
        uint256[4] roomPlayerCounts;
    }

    struct ContractStats {
        uint256 totalGamesPlayed;
        uint256 totalHistoryCount;
        uint256 currentFeeRate;
        uint256 referralPct;
        uint256 rebatePct;
        uint256 pendingFees;
        uint256 contractBalance;
        uint256 totalVolumeAll;
        uint256 minDeposit;
        uint256 survivingRooms;
        uint256 version;
        bool    isPaused;
        address successorContract;
        address mainContract;
    }

    struct PlayerInfo {
        bool    joined;
        uint8   room;
        uint256 amount;
    }

    struct ReferralInfo {
        address referrer;
        uint256 pending;
        uint256 totalEarned;
        uint256 totalWithdrawn;
    }

    mapping(uint256 => GameState)                  public  games;
    mapping(uint256 => mapping(uint8 => RoomInfo)) private gameRooms;
    mapping(uint256 => mapping(address => bool))   public  hasJoined;

    GameResult[] public gameHistory;

    event PlayerJoined(uint256 indexed gameId, address indexed player, uint8 room, uint256 amount);
    event GameFinished(uint256 indexed gameId, uint256[4] survivingRoomFlags, uint256 totalPot, uint256 feeTaken, uint256 distributed, bool empty);
    event WinnerPaid(uint256 indexed gameId, address indexed player, uint256 amount);
    event WinnerPayFailed(uint256 indexed gameId, address indexed player, uint256 amount);
    event Claimed(address indexed player, uint256 amount);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    event FeeRateChanged(uint256 oldRate, uint256 newRate);
    event ReferralPctChanged(uint256 oldPct, uint256 newPct);
    event RebatePctChanged(uint256 oldPct, uint256 newPct);
    event MinDepositChanged(uint256 oldMin, uint256 newMin);
    event Paused(address by);
    event Unpaused(address by);
    event SuccessorSet(address successor);
    event OwnershipTransferStarted(address indexed prev, address indexed next);
    event OwnershipTransferred(address indexed prev, address indexed next);
    event ReferralEarned(address indexed referrer, address indexed player, uint256 amount);
    event RebateEarned(address indexed player, uint256 amount);
    event ReferralWithdrawn(address indexed referrer, uint256 amount);
    event RebateWithdrawn(address indexed player, uint256 amount);
    event EmergencyWithdraw(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "Reentrant");
        _locked = true;
        _;
        _locked = false;
    }

    /**
     * @param initialFeeRate  手续费比例 1~30
     * @param initialMinDeposit 最低投入（单位 wei）
     * @param initialSurvivingRooms 存活房间数：1=腥风血雨 3=温柔版
     * @param mainContractAddr 主合约地址，用于读取邀请关系
     */
    constructor(
        uint256 initialFeeRate,
        uint256 initialMinDeposit,
        uint256 initialSurvivingRooms,
        address mainContractAddr
    ) {
        require(initialFeeRate >= MIN_FEE_RATE && initialFeeRate <= MAX_FEE_RATE, "Invalid fee rate");
        require(initialMinDeposit > 0, "Invalid min deposit");
        require(initialSurvivingRooms == 1 || initialSurvivingRooms == 3, "Must be 1 or 3");
        require(mainContractAddr != address(0), "Zero main contract");
        owner          = msg.sender;
        currentGameId  = 1;
        feeRate        = initialFeeRate;
        minDeposit     = initialMinDeposit;
        survivingRooms = initialSurvivingRooms;
        mainContract   = mainContractAddr;
        referralPct    = 20;
        rebatePct      = 10;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not pending owner");
        emit OwnershipTransferred(owner, pendingOwner);
        owner        = pendingOwner;
        pendingOwner = address(0);
    }

    function setFeeRate(uint256 newRate) external onlyOwner {
        require(newRate >= MIN_FEE_RATE && newRate <= MAX_FEE_RATE, "Out of range");
        emit FeeRateChanged(feeRate, newRate);
        feeRate = newRate;
    }

    function setMinDeposit(uint256 newMin) external onlyOwner {
        require(newMin > 0 && newMin <= 10 ether, "Invalid");
        emit MinDepositChanged(minDeposit, newMin);
        minDeposit = newMin;
    }

    function setReferralPct(uint256 newPct) external onlyOwner {
        require(newPct + rebatePct <= 100, "Sum exceeds 100");
        emit ReferralPctChanged(referralPct, newPct);
        referralPct = newPct;
    }

    function setRebatePct(uint256 newPct) external onlyOwner {
        require(referralPct + newPct <= 100, "Sum exceeds 100");
        emit RebatePctChanged(rebatePct, newPct);
        rebatePct = newPct;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        if (_paused) emit Paused(msg.sender);
        else         emit Unpaused(msg.sender);
    }

    function setSuccessor(address _successor) external onlyOwner {
        successor = _successor;
        emit SuccessorSet(_successor);
    }

    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = accumulatedFees;
        require(amount > 0, "No fees");
        accumulatedFees = 0;
        (bool ok,) = payable(owner).call{value: amount}("");
        require(ok, "Failed");
        emit FeesWithdrawn(owner, amount);
    }

    function emergencyWithdraw() external onlyOwner nonReentrant {
        require(paused, "Must be paused");
        uint256 amount = address(this).balance;
        require(amount > 0, "Empty");
        accumulatedFees = 0;
        (bool ok,) = payable(owner).call{value: amount}("");
        require(ok, "Failed");
        emit EmergencyWithdraw(owner, amount);
    }

    function withdrawReferral() external nonReentrant {
        uint256 amount = referralPending[msg.sender];
        require(amount > 0, "No earnings");
        referralPending[msg.sender]        = 0;
        referralTotalWithdrawn[msg.sender] += amount;
        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Failed");
        emit ReferralWithdrawn(msg.sender, amount);
    }

    function withdrawRebate() external nonReentrant {
        uint256 amount = rebatePending[msg.sender];
        require(amount > 0, "No rebate");
        rebatePending[msg.sender] = 0;
        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Failed");
        emit RebateWithdrawn(msg.sender, amount);
    }

    function claim() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "Nothing");
        claimable[msg.sender] = 0;
        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Failed");
        emit Claimed(msg.sender, amount);
    }

    function joinRoom(uint8 room) external payable nonReentrant {
        require(!paused,                 "Paused");
        require(room < ROOM_COUNT,       "Invalid room");
        require(msg.value >= minDeposit, "Below min");

        uint256 gid = currentGameId;
        if (games[gid].isFinished) {
            require(successor == address(0), "Migrated");
            gid = ++currentGameId;
        }

        GameState storage gs = games[gid];
        require(!gs.isFinished,              "Finished");
        require(!hasJoined[gid][msg.sender], "Joined");

        hasJoined[gid][msg.sender] = true;
        gs.totalPlayers           += 1;

        RoomInfo storage ri        = gameRooms[gid][room];
        ri.totalAmount            += msg.value;
        ri.deposits[msg.sender]    = msg.value;
        ri.players.push(msg.sender);

        uint256[] storage ids = playerGameIds[msg.sender];
        if (ids.length == 0 || ids[ids.length - 1] != gid) {
            ids.push(gid);
        }

        PlayerStats storage ps = playerStats[msg.sender];
        ps.totalGames     += 1;
        ps.totalDeposited += msg.value;
        totalVolumeAll    += msg.value;

        emit PlayerJoined(gid, msg.sender, room, msg.value);

        if (gs.totalPlayers >= MAX_PLAYERS) {
            _settleGame(gid);
        }
    }

    function _settleGame(uint256 gid) internal {
        games[gid].isFinished = true;
        totalGamesPlayed     += 1;

        (
            uint256           totalPot,
            uint256[4] memory roomTotals,
            uint256[4] memory playerCounts
        ) = _snapshotRooms(gid);

        (uint256[4] memory survivingFlags, uint256 addrEntropy, uint256 seedVal) =
            _pickSurvivors(gid, totalPot, roomTotals);

        (uint256 feeTaken, uint256 distributed, bool empty) =
            _distributeRewards(gid, survivingFlags, totalPot, roomTotals);

        uint256 idx = gameHistory.length;
        gameIdToIndex[gid] = idx;

        _recordHistory(gid, survivingFlags, totalPot, feeTaken, distributed,
                       roomTotals, playerCounts, addrEntropy, seedVal);

        emit GameFinished(gid, survivingFlags, totalPot, feeTaken, distributed, empty);
    }

    function _snapshotRooms(uint256 gid)
        internal view
        returns (
            uint256           totalPot,
            uint256[4] memory roomTotals,
            uint256[4] memory playerCounts
        )
    {
        for (uint8 i = 0; i < 4; i++) {
            RoomInfo storage ri = gameRooms[gid][i];
            roomTotals[i]   = ri.totalAmount;
            playerCounts[i] = ri.players.length;
            totalPot       += roomTotals[i];
        }
    }

    /**
     * @dev 核心：随机选出淘汰房间，返回存活标志数组
     *      survivingRooms=1（腥风）：随机选1个房间存活，其余淘汰
     *      survivingRooms=3（温柔）：随机选1个房间淘汰，其余存活
     *      survivingFlags[i]=1 表示房间i存活，0表示淘汰
     */
    function _pickSurvivors(
        uint256           gid,
        uint256           totalPot,
        uint256[4] memory roomTotals
    ) internal view returns (uint256[4] memory survivingFlags, uint256 addrEntropy, uint256 seedVal) {
        for (uint8 i = 0; i < 4; i++) {
            address[] storage players = gameRooms[gid][i].players;
            for (uint256 j = 0; j < players.length; j++) {
                addrEntropy ^= uint256(uint160(players[j]));
            }
        }

        seedVal = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1), block.timestamp, block.number,
            gid, totalPot,
            roomTotals[0], roomTotals[1], roomTotals[2], roomTotals[3],
            addrEntropy
        )));

        uint8[4] memory active;
        uint8 cnt;
        for (uint8 i = 0; i < 4; i++) {
            if (roomTotals[i] > 0) active[cnt++] = i;
        }

        if (survivingRooms == 1) {
            uint8 winRoom = active[seedVal % cnt];
            survivingFlags[winRoom] = 1;
        } else {
            for (uint8 i = 0; i < 4; i++) survivingFlags[i] = 1;
            uint8 loseRoom = active[seedVal % cnt];
            survivingFlags[loseRoom] = 0;
        }
    }

    function _distributeRewards(
        uint256           gid,
        uint256[4] memory survivingFlags,
        uint256           totalPot,
        uint256[4] memory roomTotals
    ) internal returns (uint256 feeTaken, uint256 distributed, bool empty) {
        uint256 fee = (totalPot * feeRate) / 100;
        distributed = totalPot - fee;
        feeTaken    = fee;

        uint256 referralTotal = _distributeReferralFees(gid);
        uint256 netFee = referralTotal >= fee ? 0 : fee - referralTotal;
        accumulatedFees += netFee;

        uint256 winnerTotal = 0;
        for (uint8 i = 0; i < 4; i++) {
            if (survivingFlags[i] == 1) winnerTotal += roomTotals[i];
        }

        if (winnerTotal == 0) {
            accumulatedFees += distributed;
            feeTaken        += distributed;
            distributed      = 0;
            empty            = true;
        } else {
            _payWinners(gid, survivingFlags, distributed, winnerTotal);
            empty = false;
        }
    }

    /**
     * @dev 读主合约邀请关系，佣金存在本合约
     */
    function _distributeReferralFees(uint256 gid)
        internal returns (uint256 totalDeducted)
    {
        for (uint8 room = 0; room < 4; room++) {
            address[] storage players = gameRooms[gid][room].players;
            for (uint256 j = 0; j < players.length; j++) {
                address player = players[j];
                address ref;
                try IMainContract(mainContract).referrerOf(player) returns (address r) {
                    ref = r;
                } catch {
                    continue;
                }
                if (ref == address(0)) continue;
                uint256 dep        = gameRooms[gid][room].deposits[player];
                uint256 playerFee  = (dep * feeRate) / 100;
                uint256 refEarning = (playerFee * referralPct) / 100;
                uint256 rebate     = (playerFee * rebatePct) / 100;
                referralPending[ref]                  += refEarning;
                referralTotalEarned[ref]              += refEarning;
                playerStats[ref].totalReferralEarned  += refEarning;
                rebatePending[player]                 += rebate;
                rebateTotalEarned[player]             += rebate;
                playerStats[player].totalRebateEarned += rebate;
                totalDeducted                         += refEarning + rebate;
                emit ReferralEarned(ref, player, refEarning);
                emit RebateEarned(player, rebate);
            }
        }
    }

    /**
     * @dev 按全局投入占比分奖，存活的所有房间玩家均可获奖
     */
    function _payWinners(
        uint256           gid,
        uint256[4] memory survivingFlags,
        uint256           distributed,
        uint256           winnerTotal
    ) internal {
        uint256 winnerCount;
        for (uint8 i = 0; i < 4; i++) {
            if (survivingFlags[i] == 1) winnerCount += gameRooms[gid][i].players.length;
        }
        uint256 totalPaid;
        uint256 seq;
        for (uint8 room = 0; room < 4; room++) {
            if (survivingFlags[room] != 1) continue;
            address[] storage ps = gameRooms[gid][room].players;
            for (uint256 j = 0; j < ps.length; j++) {
                seq++;
                address who = ps[j];
                uint256 payout = (seq == winnerCount)
                    ? distributed - totalPaid
                    : (distributed * gameRooms[gid][room].deposits[who]) / winnerTotal;
                if (payout == 0) continue;
                totalPaid += payout;
                playerStats[who].totalWon += payout;
                (bool ok,) = payable(who).call{value: payout}("");
                if (ok) { emit WinnerPaid(gid, who, payout); }
                else    { claimable[who] += payout; emit WinnerPayFailed(gid, who, payout); }
            }
        }
    }

    function _recordHistory(
        uint256           gid,
        uint256[4] memory survivingFlags,
        uint256           totalPot,
        uint256           feeTaken,
        uint256           distributed,
        uint256[4] memory roomTotals,
        uint256[4] memory playerCounts,
        uint256           addrEntropy,
        uint256           seedVal
    ) internal {
        gameHistory.push(GameResult({
            gameId:              gid,
            survivingRooms:      survivingRooms,
            survivingRoomFlags:  survivingFlags,
            totalPot:            totalPot,
            feeTaken:            feeTaken,
            distributed:         distributed,
            timestamp:           block.timestamp,
            blockNumber:         block.number,
            blockHashSnapshot:   blockhash(block.number - 1),
            addrEntropy:         addrEntropy,
            seedValue:           seedVal,
            roomTotals:          roomTotals,
            playerCounts:        playerCounts
        }));
    }

    function getFullPageData(uint256 historyLimit)
        external view
        returns (
            CurrentSnapshot memory snapshot,
            GameResult[]    memory recentGames,
            ContractStats   memory stats
        )
    {
        snapshot    = _buildSnapshot();
        recentGames = _buildRecentHistory(historyLimit);
        stats       = _buildStats();
    }

    function getUserDashboard(address user)
        external view
        returns (
            PlayerInfo   memory info,
            ReferralInfo memory refInfo,
            PlayerStats  memory pStats,
            uint256             claimableAmount,
            uint256             rebateAmount,
            bool                isMigrated,
            address             newContract
        )
    {
        info            = _buildPlayerInfo(user);
        refInfo         = _buildReferralInfo(user);
        pStats          = playerStats[user];
        claimableAmount = claimable[user];
        rebateAmount    = rebatePending[user];
        isMigrated      = successor != address(0);
        newContract     = successor;
    }

    function getCurrentRoomPlayers()
        external view
        returns (
            address[] memory roomA,
            address[] memory roomB,
            address[] memory roomC,
            address[] memory roomD
        )
    {
        uint256 gid = currentGameId;
        roomA = gameRooms[gid][0].players;
        roomB = gameRooms[gid][1].players;
        roomC = gameRooms[gid][2].players;
        roomD = gameRooms[gid][3].players;
    }

    function getPlayerRecentGames(address player, uint256 limit)
        external view
        returns (GameResult[] memory results, uint8[] memory playerRooms, uint256[] memory playerDeposits)
    {
        uint256[] storage ids = playerGameIds[player];
        uint256 total = ids.length;
        if (total == 0 || limit == 0) {
            return (new GameResult[](0), new uint8[](0), new uint256[](0));
        }
        uint256 count  = limit < total ? limit : total;
        results        = new GameResult[](count);
        playerRooms    = new uint8[](count);
        playerDeposits = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 gid = ids[total - 1 - i];
            uint256 idx = gameIdToIndex[gid];
            if (idx < gameHistory.length && gameHistory[idx].gameId == gid) {
                results[i] = gameHistory[idx];
            }
            for (uint8 r = 0; r < 4; r++) {
                uint256 dep = gameRooms[gid][r].deposits[player];
                if (dep > 0) {
                    playerRooms[i]    = r;
                    playerDeposits[i] = dep;
                    break;
                }
            }
        }
    }

    function _buildSnapshot() internal view returns (CurrentSnapshot memory s) {
        s.gameId       = currentGameId;
        s.isFinished   = games[currentGameId].isFinished;
        s.totalPlayers = games[currentGameId].totalPlayers;
        for (uint8 i = 0; i < 4; i++) {
            s.roomAmounts[i]      = gameRooms[currentGameId][i].totalAmount;
            s.roomPlayerCounts[i] = gameRooms[currentGameId][i].players.length;
        }
    }

    function _buildRecentHistory(uint256 limit) internal view returns (GameResult[] memory) {
        uint256 total = gameHistory.length;
        if (total == 0 || limit == 0) return new GameResult[](0);
        uint256 count = limit < total ? limit : total;
        GameResult[] memory results = new GameResult[](count);
        for (uint256 i = 0; i < count; i++) {
            results[i] = gameHistory[total - 1 - i];
        }
        return results;
    }

    function _buildStats() internal view returns (ContractStats memory s) {
        s.totalGamesPlayed  = totalGamesPlayed;
        s.totalHistoryCount = gameHistory.length;
        s.currentFeeRate    = feeRate;
        s.referralPct       = referralPct;
        s.rebatePct         = rebatePct;
        s.pendingFees       = accumulatedFees;
        s.contractBalance   = address(this).balance;
        s.totalVolumeAll    = totalVolumeAll;
        s.minDeposit        = minDeposit;
        s.survivingRooms    = survivingRooms;
        s.version           = VERSION;
        s.isPaused          = paused;
        s.successorContract = successor;
        s.mainContract      = mainContract;
    }

    function _buildPlayerInfo(address user) internal view returns (PlayerInfo memory p) {
        uint256 gid = currentGameId;
        if (!hasJoined[gid][user]) return p;
        for (uint8 i = 0; i < 4; i++) {
            if (gameRooms[gid][i].deposits[user] > 0) {
                p.joined = true;
                p.room   = i;
                p.amount = gameRooms[gid][i].deposits[user];
                return p;
            }
        }
    }

    function _buildReferralInfo(address user) internal view returns (ReferralInfo memory r) {
        r.referrer       = IMainContract(mainContract).referrerOf(user);
        r.pending        = referralPending[user];
        r.totalEarned    = referralTotalEarned[user];
        r.totalWithdrawn = referralTotalWithdrawn[user];
    }

    function getHistory(uint256 offset, uint256 limit)
        external view returns (GameResult[] memory results)
    {
        uint256 total = gameHistory.length;
        if (offset >= total) return new GameResult[](0);
        uint256 end = offset + limit;
        if (end > total) end = total;
        results = new GameResult[](end - offset);
        for (uint256 i = offset; i < end; i++) results[i - offset] = gameHistory[i];
    }

    function getHistoryCount() external view returns (uint256) {
        return gameHistory.length;
    }

    receive() external payable {
        accumulatedFees += msg.value;
    }
}
