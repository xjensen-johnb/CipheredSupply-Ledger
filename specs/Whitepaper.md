# CipheredSupply-Ledger 白皮书草案

CipheredSupply-Ledger 聚焦供应链金融，确保订单、发票在链上保持隐私。

该项目现已完成端到端链上/链下适配：`CipheredSupply-Ledger/webapp` 提供角色驱动的前端体验（发货方、承运方、海关、质检、保险），所有敏感字段均通过浏览器侧 FHE 加密后提交到合约。

## 结构
- `SupplyLedger` 合约维护 `euint64` 金额、`euint32` 周期，并通过 `GatewayCaller` 与 Zama 网关交互。
- 浏览器端调用 `webapp/src/lib/fhevm.ts` 的封装，拉起 CDN 中的 Zama 0.2.0 SDK 生成句柄与证明。
- `bytes32` handle 保存证据链，配合 attestation 验证第三方凭证。
- 前端采用多 Tab 仪表盘，涵盖：发货登记、质检报告、海关清关、物流关卡、保险理赔及情报总览。

## 核心工作流

1. **发货登记**：输入承运人/收货人、重量、体积、货值、风险编码等，前端加密后调用 `submitShipment`。
2. **质检评估**：质检角色加密温湿度及评分，驱动 `conductQualityInspection` 更新状态。
3. **海关清关**：海关角色触发 `requestCustomsClearance`，等待网关解密同步合规分数。
4. **物流关卡**：物流经理利用 `recordCheckpoint` 记录位置、温湿度、扫描时间。
5. **保险理赔**：承运/收货角色条件满足时调用 `fileInsuranceClaim`，链上根据解密信息自动计算赔付区间。
6. **情报面板**：前端聚合 `getShipmentInfo / getClearanceInfo / getCheckpoint` 等数据，为风控与监管提供视图。

## 路线图
- 接入银行信用证 API，链下验证后上链。
- 构建审计报表，供监管抽检。
